import { DataSource, EarthQuake } from "../datasource/types";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as d3 from "d3";
import * as fc from "d3fc";

import { Box, IconButton, Skeleton } from "@mui/material";
import { ColorMapping } from "../datasource/formatting/color-mapping";
import { RestartAlt } from "@mui/icons-material";
import createREGL from "regl";

type D3Earthquake = EarthQuake & { date: Date };

export default function TimelineSlider({
  dataSources,
  setDataSources,
}: {
  dataSources: DataSource[];
  setDataSources: Dispatch<SetStateAction<DataSource[] | null>>;
}) {
  const setFiltering = (
    id: string,
    variableToModify: string,
    value: [number, number] | null
  ) => {
    const indexToModify = dataSources?.findIndex(
      (dataSource) => dataSource.internal_id === id
    );

    const modifiedDataSource = dataSources[indexToModify];

    if (value) {
      modifiedDataSource.filtering = {
        ...modifiedDataSource.filtering,
        [variableToModify]: value,
      };
    } else {
      delete modifiedDataSource.filtering[variableToModify];
    }

    dataSources[indexToModify] = modifiedDataSource;

    setDataSources(dataSources);
  };

  // RESPONSIVE SIZING AND LOADING

  const parentRef = useRef<HTMLElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (parentRef) {
      const observer = new ResizeObserver((entries) => {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height,
        });
      });
      observer.observe(parentRef.current as Element);
      // return () => parentRef.current && observer.unobserve(parentRef.current);
    }
  }, [parentRef]);

  console.log(dimensions);

  // START PLOT

  const margin = { top: 8, right: 8, bottom: 24, left: 26 },
    width = dimensions.width,
    height = dimensions.height;

  function main(err, regl) {
    const numPoints = 100000;
    const pointWidth = 1;
    // const width = window.innerWidth;
    // const height = window.innerHeight;

    // create initial set of points
    const rng = d3.randomNormal(0, 0.2);
    const points = d3.range(numPoints).map((i) => ({
      x: rng() * width + width / 2,
      y: rng() * height + height / 2,
      color: [0, Math.random(), 0],
    }));

    // function to compile a draw points regl func
    const drawPoints = regl({
      frag: `
		// set the precision of floating point numbers
	  precision highp float;
	  // this value is populated by the vertex shader
		varying vec3 fragColor;
		void main() {
			// gl_FragColor is a special variable that holds the color of a pixel
			gl_FragColor = vec4(fragColor, 1);
		}
		`,

      vert: `
		// per vertex attributes
		attribute vec2 position;
		attribute vec3 color;
		// variables to send to the fragment shader
		varying vec3 fragColor;
		// values that are the same for all vertices
		uniform float pointWidth;
		uniform float stageWidth;
		uniform float stageHeight;
		// helper function to transform from pixel space to normalized device coordinates (NDC)
		// in NDC (0,0) is the middle, (-1, 1) is the top left and (1, -1) is the bottom right.
		vec2 normalizeCoords(vec2 position) {
			// read in the positions into x and y vars
      float x = position[0];
      float y = position[1];
			return vec2(
	      2.0 * ((x / stageWidth) - 0.5),
	      // invert y since we think [0,0] is bottom left in pixel space
	      -(2.0 * ((y / stageHeight) - 0.5)));
		}
		void main() {
			// update the size of a point based on the prop pointWidth
			gl_PointSize = pointWidth;
      // send color to the fragment shader
      fragColor = color;
			// scale to normalized device coordinates
			// gl_Position is a special variable that holds the position of a vertex
      gl_Position = vec4(normalizeCoords(position), 0.0, 1.0);
		}
		`,

      attributes: {
        // each of these gets mapped to a single entry for each of the points.
        // this means the vertex shader will receive just the relevant value for a given point.
        position: points.map((d) => [d.x, d.y]),
        color: points.map((d) => d.color),
      },

      uniforms: {
        // by using `regl.prop` to pass these in, we can specify them as arguments
        // to our drawPoints function
        pointWidth: regl.prop("pointWidth"),

        // regl actually provides these as viewportWidth and viewportHeight but I
        // am using these outside and I want to ensure they are the same numbers,
        // so I am explicitly passing them in.
        stageWidth: regl.prop("stageWidth"),
        stageHeight: regl.prop("stageHeight"),
      },

      // specify the number of points to draw
      count: points.length,

      // specify that each vertex is a point (not part of a mesh)
      primitive: "points",
    });

    // start an animation loop
    const frameLoop = regl.frame(() => {
      // clear the buffer
      regl.clear({
        // background color (black)
        color: [0, 0, 0, 0],
        depth: 1,
      });

      // draw the points using our created regl func
      // note that the arguments are available via `regl.prop`.
      drawPoints({
        pointWidth,
        stageWidth: width,
        stageHeight: height,
      });

      // since we are only drawing once right now, let's just cancel the loop immediately
      if (frameLoop) {
        frameLoop.cancel();
      }
    });
  }

  // global data bounds

  const t_min = Math.min(
    ...dataSources.map(
      (dataSource) =>
        dataSource.metadata.data_descr.find((el) => el.variable == "t")!
          .bounds[0]
    )
  );
  const t_max = Math.max(
    ...dataSources.map(
      (dataSource) =>
        dataSource.metadata.data_descr.find((el) => el.variable == "t")!
          .bounds[1]
    )
  );

  // const m_min = Math.min(
  //   ...dataSources.map(
  //     (dataSource) =>
  //       dataSource.metadata.data_descr.find((el) => el.variable == "mag")!
  //         .bounds[0]
  //   )
  // );
  const m_max = Math.max(
    ...dataSources.map(
      (dataSource) =>
        dataSource.metadata.data_descr.find((el) => el.variable == "mag")!
          .bounds[1]
    )
  );

  const xScale = useMemo(
    () =>
      d3
        .scaleTime()
        .domain([new Date(t_min), new Date(t_max)])
        .range([0, width - margin.right - margin.left]),
    [t_min, t_max, margin.left, margin.right, width]
  );
  const yScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, m_max] as Iterable<d3.NumberValue>)
        .range([height - margin.top - margin.bottom, 0]),
    [m_max, height, margin.top, margin.bottom]
  );
  const xScaleOriginal = useMemo(() => xScale.copy(), [xScale]);
  const yScaleOriginal = useMemo(() => yScale.copy(), [yScale]);

  const contextRef = useRef<CanvasRenderingContext2D>(null);
  const dataRef = useRef<D3Earthquake[]>(null);

  // const dataSourceRef = useRef<DataSource>(dataSources[0]);
  // const [colorFormatting, setColorFormatting]  = useState<DataSourceColorFormatting>(
  //   dataSources[0].formatting.color
  // );

  useEffect(() => {
    d3.select("#timeline-graph").select("svg").remove();
    d3.select("#timeline-graph").select("canvas").remove();

    const container = d3.select("#timeline-graph");

    const canvas = container
      .append("canvas")
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .style("position", "absolute")
      .style("display", "block")
      .style("margin-left", margin.left + "px")
      .style("margin-top", margin.top + "px")
      .attr("id", "timeline-graph-canvas");

    // append the svg object to the body of the page
    const svg = container
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const context = canvas.node()!.getContext("webgl")!;

    // contextRef.current = context;

    // ADD X-AXIS
    const xAxes = svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
      .call(
        d3.axisBottom(xScale)
        // .tickFormat(() => "")
      );

    xAxes.selectAll("line").attr("stroke-opacity", 0.6);

    //ADD Y-AXIS
    const yAxes = svg
      .append("g")
      .call(
        d3.axisLeft(yScale)
        // .tickFormat(() => "")
      );
    yAxes.selectAll("line").attr("stroke-opacity", 0.6);

    d3.json(
      `http://${process.env.NEXT_PUBLIC_HOST}${process.env.NEXT_PUBLIC_APP_BASE_PATH}/api/plot_data?mode=timeline_plot&filename=${dataSources[0].filename}`
    )
      .then((data) => {
        if (!data) {
          console.log("no data");
        } else {
          (data as D3Earthquake[]).forEach((d: D3Earthquake) => {
            const t = Math.round(d["t"] as number);
            d.date = new Date(t);
          });

          dataRef.current = data as D3Earthquake[];

          // const pointSeries = fc
          //   .seriesWebglPoint()
          //   .size(1)
          //   .crossValue((d: D3Earthquake) => d.date)
          //   .mainValue((d: D3Earthquake) => d.mag)
          //   .context(context)
          //   .call(data);

          // pointSeries(data)

          // console.log(pointSeries)

          createREGL({
            gl: context,
            // callback when regl is initialized
            onDone: main,
          });

          // function drawPoint(d: D3Earthquake) {
          //   context.beginPath();

          //   const clr = ColorMapping(d, dataSources[0].formatting.color)!;
          //   context.fillStyle = `rgb(${clr[0]},${clr[1]},${clr[2]})`;
          //   const px = xScale(d.date);
          //   const py = yScale(d.mag);

          //   context.arc(px, py, 1.2, 0, 2 * Math.PI, true);
          //   context.fill();
          // }

          // (data as D3Earthquake[]).forEach((d) => {
          //   drawPoint(d);
          // });

          // svg
          //   .append("g")
          //   .attr("stroke", "#000")
          //   .attr("stroke-opacity", 0.2)
          //   .selectAll()
          //   .data(data as D3Earthquake[])
          //   .join("circle")
          //   .attr("cx", (d: D3Earthquake) => x(d["t"] as number))
          //   .attr("cy", (d: D3Earthquake) => y(d["mag"] as number))
          //   .attr("r", 0.5);
        }
      })
      .then(() => {
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions]);

  // useEffect(() => {
  //   // initialize regl
  //   createREGL({
  //     container: "timeline-graph-canvas",
  //     // callback when regl is initialized
  //     onDone: main,
  //   });
  // }, [parentRef]);

  // add datapoints (seperate to ensure no complete rerender when data changes)

  // useEffect(() => {
  //   if (colorFormatting != dataSources[0].formatting.color) {
  //     setColorFormatting(dataSources[0].formatting.color);
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [dataSources]);

  const reload = () => {
    setIsLoading(true);

    const context = contextRef.current!;

    const data = dataRef.current;

    if (data && context) {
      function drawPoint(d: D3Earthquake) {
        context.beginPath();

        const clr = ColorMapping(d, dataSources[0].formatting.color)!;
        context.fillStyle = `rgb(${clr[0]},${clr[1]},${clr[2]})`;
        const px = xScale(d.date);
        const py = yScale(d.mag);

        context.arc(px, py, 1.2, 0, 2 * Math.PI, true);
        context.fill();
      }

      (data as D3Earthquake[]).forEach((d) => {
        drawPoint(d);
      });

      setIsLoading(false);
    }
  };

  const [localDomain, setLocalDomain] = useState<[number, number]>([
    t_min,
    t_max,
  ]);

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
      }}
    >
      <IconButton sx={{ position: "absolute", zIndex: 2000, top: margin.top + 4, left: margin.left }} onClick={reload}>
        <RestartAlt />
      </IconButton>
      <Box
        ref={parentRef}
        id="timeline-graph"
        style={{
          position: "relative",
          height: "100%",
          width: "100%",
          margin: "-8px",
          top: 8,
          left: 8,
          canvas: {
            width: "300px",
          },
        }}
      >
        {isLoading && (
          <Skeleton
            sx={{
              position: "absolute",
              top: margin.top + "px",
              left: margin.left + "px",
            }}
            variant="rectangular"
            width={dimensions.width - margin.left - margin.right}
            height={dimensions.height - margin.top - margin.bottom}
          />
        )}
      </Box>
      {/* <Slider
        value={localDomain}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => (
          <Typography fontSize={12}>{Math.round(value)}</Typography>
        )}
        min={t_min}
        max={t_max}
        // step={step}
        // marks={marks}
        onChange={(event: Event, newValue: number | number[]) => {
          setLocalDomain(newValue as [number, number]);
          setFiltering(
            dataSources[0].internal_id,
            "t",
            newValue as [number, number]
          );
        }}
        size="small"
        // onChangeCommitted={onChangeCommitted}
        sx={{
          position: "absolute",
          left: margin.left + "px",
          bottom: 2 + "px",
          width: dimensions.width - margin.left - margin.right,
        }}
      /> */}
    </div>
  );
}
