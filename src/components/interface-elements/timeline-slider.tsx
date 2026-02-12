/* eslint-disable react-hooks/exhaustive-deps */
import DeckGL from "@deck.gl/react";
import {
  Box,
  Divider,
  Grow,
  IconButton,
  Input,
  Paper,
  SelectChangeEvent,
  Select,
  MenuItem,
  Checkbox,
  useTheme,
} from "@mui/material";
import { OrthographicView, PickingInfo, ScatterplotLayer } from "deck.gl";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as d3 from "d3";

import { useProjectStore } from "@/providers/project-store-provider";
import { StemPlotLayers } from "../map/generate-datasource-layers";
// import { fetchData } from "../datasource/load-data";
// import { useDataStore } from "@/providers/data-store-provider";
import { useData } from "../datasource/hooks";
import { EarthQuake } from "../datasource/types";
import MapToolTip from "../map/map-tooltip";
import { ControllerOptions } from "../map/types";
import useAnimationFrame from "use-animation-frame";
import { useAppStateStore } from "@/providers/app-state-provider";
import {
  GradientHorizontal,
  Selection,
  SelectionOff,
  Speedometer,
} from "mdi-material-ui";
import { useTranslations } from "next-intl";
import { Pause, PlayArrow } from "@mui/icons-material";

interface Bounds {
  x: [Date, Date];
  y: [number, number];
}
interface ViewPortBounds {
  pixel: { x: [number, number]; y: [number, number] };
  coord: { x: [Date, Date]; y: [number, number] };
}

interface ViewStateMonitor {
  pixelPosition: [number, number];
  coordPosition: [Date, number];
  zoom: [number, number];
}

type D3Earthquake = EarthQuake & { date: Date };

export default function TimelineSlider() {
  const t = useTranslations();
  const theme = useTheme();
  // TOOLTIP
  const sessionInterface = useProjectStore((state) => state.sessionInterface);

  const { appInterface } = useAppStateStore((state) => state);

  const [hoverInfo, setHoverInfo] = useState<PickingInfo<EarthQuake>>();
  // app stores
  const { dataSources } = useProjectStore((state) => state);
  const { data } = useData();

  // filtering

  const GPUfiltering = useProjectStore((state) => state.GPUfiltering);

  const setTimeFiltering = useProjectStore(
    (state) => state.GPUfilteringActions.setTimeFiltering,
  );

  // animation

  const {
    enabled: animationEnabled,
    tapered,
    speed: animationSpeed,
  } = useProjectStore((state) => state.sessionInterface.animation.timeline);
  const {
    toggleEnabled: toggleAnimationEnabled,
    setTapered,
    setSpeed: setAnimationSpeed,
  } = useProjectStore((state) => state.interfaceActions.animation.timeline);

  // state for setting dimensions of graph in container
  const parentRef = useRef<HTMLInputElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // graph specific data
  const [viewStateMonitor, setViewStateMonitor] = useState<ViewStateMonitor>({
    pixelPosition: [0, 0],
    coordPosition: [new Date(1970, 1, 1), 0],
    zoom: [0, 0],
  });
  const [bounds, setBounds] = useState<Bounds>({
    x: [new Date(1970, 1, 1), new Date(2025, 1, 1)],
    y: [0, 1],
  });

  // graph constants
  const margin = { top: 16, right: 16, bottom: 36, left: 52 };

  const graphWidth = useMemo(
    () => dimensions.width - margin.left - margin.right,
    [dimensions],
  );
  const graphHeight = useMemo(
    () => 200 - margin.top - margin.bottom,
    [dimensions],
  );

  const [viewPortBounds, setViewPortBounds] = useState<ViewPortBounds>({
    pixel: { x: [0, graphWidth], y: [0, graphHeight] },
    coord: { x: [new Date(1970, 1, 1), new Date(2025, 1, 1)], y: [0, 1] },
  });

  const [localDomain, setLocalDomain] = useState<[number, number]>([
    bounds.x[0].getTime(),
    bounds.x[1].getTime(),
  ]);

  useEffect(() => {
    if (GPUfiltering.t[0] == 0 && GPUfiltering.t[1] == 2147483647) {
      setLocalDomain([bounds.x[0].getTime(), bounds.x[1].getTime()]);
      setTimeFiltering([bounds.x[0].getTime(), bounds.x[1].getTime()]);
    } else {
      setLocalDomain(GPUfiltering.t as [number, number]);
    }
  }, []);

  // ANIMATION

  const [isPlaying, setIsPlaying] = useState<string>("stopped");

  const speed = useMemo(() => {
    if (animationSpeed) {
      if (animationSpeed.unit == "second") {
        return animationSpeed.multiplier;
      } else if (animationSpeed.unit == "minute") {
        return animationSpeed.multiplier * 60;
      } else if (animationSpeed.unit == "hour") {
        return animationSpeed.multiplier * 3600;
      } else if (animationSpeed.unit == "day") {
        return animationSpeed.multiplier * 86400;
      } else if (animationSpeed.unit == "week") {
        return animationSpeed.multiplier * 7 * 86400;
      } else if (animationSpeed.unit == "year") {
        return animationSpeed.multiplier * 365.25 * 86400;
      }
    } else {
      return 86400; //s s⁻1
    }
  }, [animationSpeed]) as number;

  const calcNewPosition = (e: { time: number; delta: number }) => {
    // if (localDomain[0] < bounds.x[0].getTime()) {

    if (localDomain[0] >= bounds.x[1].getTime()) {
      return [
        bounds.x[0].getTime() - (localDomain[1] - localDomain[0]),
        bounds.x[0].getTime(),
      ] as [number, number];
    } else {
      return [
        localDomain[0] + speed * e.delta * 1000,
        localDomain[1] + speed * e.delta * 1000,
      ] as [number, number];
    }
  };

  useAnimationFrame((e) => {
    if (isPlaying == "playing") {
      setLocalDomain(calcNewPosition(e) as [number, number]);
      setTimeFiltering(calcNewPosition(e) as [number, number]);
    }
  });

  // graph elements (store statically in component)
  // svg element
  const SVG =
    useRef<d3.Selection<SVGGElement, unknown, HTMLElement, unknown>>(null);

  // scales
  const scaleX = useRef<d3.ScaleTime<number, number, never>>(null),
    scaleY = useRef<d3.ScaleLinear<number, number, never>>(null);
  const viewPortScaleX = useRef<d3.ScaleTime<number, number, never>>(null),
    viewPortScaleY = useRef<d3.ScaleLinear<number, number, never>>(null);
  // axes
  const xAxes =
      useRef<d3.Selection<SVGGElement, unknown, HTMLElement, unknown>>(null),
    yAxes =
      useRef<d3.Selection<SVGGElement, unknown, HTMLElement, unknown>>(null);
  const xAxesGrid =
      useRef<d3.Selection<SVGGElement, unknown, HTMLElement, unknown>>(null),
    yAxesGrid =
      useRef<d3.Selection<SVGGElement, unknown, HTMLElement, unknown>>(null);

  useEffect(() => {
    if (parentRef) {
      const observer = new ResizeObserver((entries) => {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height,
        });
      });
      observer.observe(parentRef.current as Element);
    }
  }, [parentRef]);

  // references for brushing
  const brushRef = useRef<d3.BrushBehavior<unknown>>(null);

  const onBrush = useCallback(
    (event: d3.D3BrushEvent<D3Earthquake>) => {
      const selection = event.selection;

      if (event.type == "end") {
        if (isPlaying == "paused") {
          setIsPlaying("playing");
        }
      }

      if (!event.sourceEvent) return;

      if (selection == null) {
        setLocalDomain([bounds.x[0].getTime(), bounds.x[1].getTime()]);
        setTimeFiltering([bounds.x[0].getTime(), bounds.x[1].getTime()]);
      } else {
        const newValue = [
          scaleX.current!.invert(selection[0] as number).getTime(),
          scaleX.current!.invert(selection[1] as number).getTime(),
        ];

        console.log("brush call", newValue);

        setLocalDomain(newValue as [number, number]);
        setTimeFiltering(newValue as [number, number]);
      }
    },
    [isPlaying, setTimeFiltering, bounds],
  );

  const onBrushStart = useCallback(
    (event: d3.D3BrushEvent<D3Earthquake>) => {
      if (
        (event.mode == "drag" || event.mode == "handle") &&
        isPlaying == "playing"
      ) {
        setIsPlaying("paused");
      }
    },
    [isPlaying],
  );

  // Ensure that the brush effect is updated everytime a dataSource changes so it doesn't override formatting
  useEffect(() => {
    const brush = brushRef.current;

    if (brush) {
      brush.on("brush", onBrush);
      brush.on("end", onBrush);
    }
  }, [onBrush]);

  const moveBrush = useCallback(
    (newDomain: [number, number]) => {
      // console.log("Brush Move", newDomain)
      const brush = brushRef.current;
      if (brush) {
        SVG.current!.select(".brush").call(brush.move as never, [
          newDomain[0] >= bounds.x[0].getTime()
            ? scaleX.current!(new Date(newDomain[0]))
            : scaleX.current!(bounds.x[0]),
          newDomain[1] <= bounds.x[1].getTime()
            ? scaleX.current!(new Date(newDomain[1]))
            : scaleX.current!(bounds.x[1]),
        ]);
      }
    },
    [bounds, scaleX],
  );

  // initial move
  useEffect(() => {
    if (
      !(
        localDomain[0] === bounds.x[0].getTime() &&
        localDomain[1] === bounds.x[1].getTime()
      )
    ) {
      moveBrush(localDomain);
    }
  }, []);

  // change listener, i.e. sync d3 and slider
  useEffect(() => {
    if (
      !(
        localDomain[0] === bounds.x[0].getTime() &&
        localDomain[1] === bounds.x[1].getTime()
      )
    ) {
      moveBrush(localDomain);
    }
  }, [localDomain]);

  // init graph
  useEffect(() => {
    const width = dimensions.width,
      height = 200;

    d3.select("#chart-stem-plot").select("svg").remove();

    SVG.current = d3
      .select("#chart-stem-plot")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g");

    scaleX.current = d3
      .scaleUtc()
      .domain([bounds.x[0], bounds.x[1]] as Iterable<d3.NumberValue>)
      .range([margin.left, width - margin.right]);

    scaleY.current = d3
      .scaleLinear()
      .domain([bounds.y[0], bounds.y[1]] as Iterable<d3.NumberValue>)
      .range([height - margin.bottom, margin.top]);

    // x axes
    xAxes.current = SVG.current
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .style("font-size", ".9rem")
      .call(d3.axisBottom(scaleX.current));

    // x axes label
    SVG.current
      .append("text")
      .attr("x", graphWidth / 2)
      .attr("y", height - 7)
      .attr("dx", margin.left)
      .attr("font-size", "1rem")
      .attr("text-anchor", "middle")
      .text("Time");

    // y axes
    yAxes.current = SVG.current
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .style("font-size", ".9rem")
      .call(d3.axisLeft(scaleY.current).ticks(4));

    // y axes label
    SVG.current
      .append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -(margin.top + height / 2))
      .attr("y", 3) // Relative to the y axis.
      .attr("text-anchor", "middle")
      .attr("font-size", "1rem")
      .attr("dy", "1rem")
      .text("Magnitude");

    // Add top stroke
    SVG.current
      .append("g")
      .attr("transform", `translate(0, ${margin.top})`)
      .call(d3.axisTop(scaleX.current).tickSize(0).tickValues([]));

    // Add right stroke
    SVG.current
      .append("g")
      .attr("transform", `translate(${width - margin.right}, 0)`)
      .call(d3.axisRight(scaleY.current).tickSize(0).tickValues([]));

    // Add vertical gridlines
    xAxesGrid.current = SVG.current!.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .style("stroke", "gray")
      .style("stroke-width", 0.5)
      .style("stroke-dasharray", "2 2")
      .call(
        d3
          .axisBottom(scaleX.current)
          .tickFormat(() => "")
          .tickSize(-graphHeight),
      );

    // Add horizontal gridlines
    yAxesGrid.current = SVG.current!.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .style("stroke", "gray")
      .style("stroke-width", 0.5)
      .style("stroke-dasharray", "2 2")
      .call(
        d3
          .axisLeft(scaleY.current)
          .tickFormat(() => "")
          .tickSize(-graphWidth),
      );

    // BRUSH

    // create the d3-brush generator
    const brush = d3
      .brushX()
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ])
      .on("start", onBrushStart)
      .on("brush", onBrush)
      .on("end", onBrush);

    // attach the brush to the chart
    SVG.current.append("g").attr("class", "brush").call(brush);

    brushRef.current = brush;

    // setIsLoading(true);
  }, [dimensions, margin.bottom, margin.left, margin.right, margin.top]);

  // // set bounds
  // useEffect(() => {
  //   Object.keys(data).map((dataSourceID) => {
  //     const dataSource = dataSources.byID[dataSourceID];

  //     setBounds({
  //       x: [
  //         new Date(dataSource.metadata.variables.by_id["t"].bounds[0]),
  //         new Date(dataSource.metadata.variables.by_id["t"].bounds[1]),
  //       ],
  //       y: dataSource.metadata.variables.by_id["mag"].bounds,
  //     });
  //   });
  // }, [data, parentRef]);

  // set bounds based on ViewState
  useEffect(() => {
    if (viewPortScaleX.current && viewPortScaleY.current) {
      const newXBounds = [
        viewPortScaleX.current.invert(
          viewStateMonitor.pixelPosition[0] -
            (graphWidth * 0.5) / Math.pow(2, viewStateMonitor.zoom[0]),
        ),
        viewPortScaleX.current.invert(
          viewStateMonitor.pixelPosition[0] +
            (graphWidth * 0.5) / Math.pow(2, viewStateMonitor.zoom[0]),
        ),
      ] as [Date, Date];

      const newYBounds = [
        viewPortScaleY.current.invert(
          viewStateMonitor.pixelPosition[1] + graphHeight * 0.5,
        ),
        viewPortScaleY.current.invert(
          viewStateMonitor.pixelPosition[1] - graphHeight * 0.5,
        ),
      ] as [number, number];

      setBounds({
        x: newXBounds,
        y: newYBounds,
      });
      setTimeFiltering([newXBounds[0].getTime(), newXBounds[1].getTime()]);

      // update bounds in DOM

      // update domains on scales
      scaleX.current!.domain(bounds.x);
      scaleY.current!.domain(bounds.y);

      if (
        !(scaleX.current!.domain()[0] < viewPortBounds.coord.x[0]) &&
        !(scaleX.current!.domain()[1] > viewPortBounds.coord.x[1]) &&
        !(viewStateMonitor.zoom[0] == 0)
      ) {
        // update X axes and grid
        xAxes.current!.call(d3.axisBottom(scaleX.current!));
        xAxesGrid.current!.call(
          d3
            .axisBottom(scaleX.current!)
            .tickFormat(() => "")
            .tickSize(-graphHeight),
        );
      }

      if (
        !(scaleY.current!.domain()[0] < viewPortBounds.coord.y[0]) &&
        !(scaleY.current!.domain()[1] > viewPortBounds.coord.y[1]) &&
        !(viewStateMonitor.zoom[0] == 0)
      ) {
        // update Y axes and grid
        yAxes.current
          ?.transition()
          .duration(10)
          .call(d3.axisLeft(scaleY.current!).ticks(4));
        yAxesGrid.current
          ?.transition()
          .duration(10)
          .call(
            d3
              .axisLeft(scaleY.current!)
              .tickFormat(() => "")
              .tickSize(-graphWidth),
          );
      }
    }
  }, [viewStateMonitor]);

//   // update bounds in DOM
//   useEffect(() => {  // update bounds in DOM
//   useEffect(() => {
//     // update domains on scales
//     scaleX.current!.domain(bounds.x);
//     scaleY.current!.domain(bounds.y);

//     if (
//       !(scaleX.current!.domain()[0] < viewPortBounds.coord.x[0]) &&
//       !(scaleX.current!.domain()[1] > viewPortBounds.coord.x[1]) &&
//       !(viewStateMonitor.zoom[0] == 0)
//     ) {
//       // update X axes and grid
//       xAxes.current!.call(d3.axisBottom(scaleX.current!));
//       xAxesGrid.current!.call(
//         d3
//           .axisBottom(scaleX.current!)
//           .tickFormat(() => "")
//           .tickSize(-graphHeight),
//       );
//     }

//     if (
//       !(scaleY.current!.domain()[0] < viewPortBounds.coord.y[0]) &&
//       !(scaleY.current!.domain()[1] > viewPortBounds.coord.y[1]) &&
//       !(viewStateMonitor.zoom[0] == 0)
//     ) {
//       // update Y axes and grid
//       yAxes.current
//         ?.transition()
//         .duration(10)
//         .call(d3.axisLeft(scaleY.current!).ticks(4));
//       yAxesGrid.current
//         ?.transition()
//         .duration(10)
//         .call(
//           d3
//             .axisLeft(scaleY.current!)
//             .tickFormat(() => "")
//             .tickSize(-graphWidth),
//         );
//     }
//   }, [bounds]);
//     // update domains on scales
//     scaleX.current!.domain(bounds.x);
//     scaleY.current!.domain(bounds.y);

//     if (
//       !(scaleX.current!.domain()[0] < viewPortBounds.coord.x[0]) &&
//       !(scaleX.current!.domain()[1] > viewPortBounds.coord.x[1]) &&
//       !(viewStateMonitor.zoom[0] == 0)
//     ) {
//       // update X axes and grid
//       xAxes.current!.call(d3.axisBottom(scaleX.current!));
//       xAxesGrid.current!.call(
//         d3
//           .axisBottom(scaleX.current!)
//           .tickFormat(() => "")
//           .tickSize(-graphHeight),
//       );
//     }

//     if (
//       !(scaleY.current!.domain()[0] < viewPortBounds.coord.y[0]) &&
//       !(scaleY.current!.domain()[1] > viewPortBounds.coord.y[1]) &&
//       !(viewStateMonitor.zoom[0] == 0)
//     ) {
//       // update Y axes and grid
//       yAxes.current
//         ?.transition()
//         .duration(10)
//         .call(d3.axisLeft(scaleY.current!).ticks(4));
//       yAxesGrid.current
//         ?.transition()
//         .duration(10)
//         .call(
//           d3
//             .axisLeft(scaleY.current!)
//             .tickFormat(() => "")
//             .tickSize(-graphWidth),
//         );
//     }
//   }, [bounds]);

  const layers = useMemo(() => {
    if (data) {
      if (scaleX.current && scaleY.current) {
        const minX = Math.min(
          ...data.allIDs.map((id) => data.byID[id]!.bounds["t"]![0]),
        );
        const maxX = Math.max(
          ...data.allIDs.map((id) => data.byID[id]!.bounds["t"]![1]),
        );

        const minY = Math.min(
          ...data.allIDs.map((id) => data.byID[id]!.bounds["mag"]![0]),
        );
        const maxY = Math.max(
          ...data.allIDs.map((id) => data.byID[id]!.bounds["mag"]![1]),
        );

        viewPortScaleX.current = d3
          .scaleUtc()
          .domain([minX, maxX] as Iterable<d3.NumberValue>)
          .range([margin.left, graphWidth + margin.left]);

        viewPortScaleY.current = d3
          .scaleLinear()
          .domain([minY, maxY] as Iterable<d3.NumberValue>)
          .range([graphHeight + margin.top, margin.top]);

        // const ViewPortPadding = 36;

        const viewPortXbounds = [
          viewPortScaleX.current!(new Date(minX)), // - ViewPortPadding,
          viewPortScaleX.current!(new Date(maxX)), // ViewPortPadding,
        ] as [number, number];

        const viewPortYbounds = [
          viewPortScaleY.current!(minY), //- ViewPortPadding,
          viewPortScaleY.current!(maxY), // + 0.25 * ViewPortPadding,
        ] as [number, number];

        setViewPortBounds({
          pixel: {
            x: viewPortXbounds,
            y: viewPortYbounds,
          },
          coord: {
            x: [
              viewPortScaleX.current!.invert(viewPortXbounds[0]),
              viewPortScaleX.current!.invert(viewPortXbounds[1]),
            ],
            y: [
              viewPortScaleY.current!.invert(viewPortYbounds[0]),
              viewPortScaleY.current!.invert(viewPortYbounds[1]),
            ],
          },
        });

        const layers_to_set = data.allIDs.map((id) => {
          if (data.byID[id]) {
            const layer = StemPlotLayers(
              dataSources.byID[id],
              data.byID[id].data,
              sessionInterface,
              viewPortScaleX.current!,
              viewPortScaleY.current!,
              viewPortScaleY.current!(minY),
              false,
            ) as ScatterplotLayer;

            layer.onHover = (info: PickingInfo<EarthQuake>) => {
              setHoverInfo(info);
              return true;
            };

            return layer;
          }
        });
        return layers_to_set;
      }
    }
  }, [
    dimensions,
    dataSources.byID,
    data.allIDs,
    scaleX,
    scaleY,
    sessionInterface,
  ]);

  return (
    <Box
      style={{
        position: "relative",
        display: "block",
        minHeight: "200px",
      }}
    >
      <Box
        ref={parentRef}
        id="chart-stem-plot"
        sx={{ position: "relative", zIndex: 30 }}
      ></Box>
      <DeckGL
        style={{
          position: "absolute",
          width: graphWidth + "px",
          height: graphHeight + "px",
          top: margin.top + "px",
          left: margin.left + "px",
          pointerEvents: animationEnabled ? "none" : "inherit",
          cursor: sessionInterface.pickable ? "crosshair" : "auto",
          zIndex: "40",
        }}
        views={
          new OrthographicView({
            width: graphWidth,
            height: graphHeight,
          })
        }
        controller={
          {
            scrollZoom: { speed: 0.003 },
            zoomAxis: "X",
            keyboard: { moveSpeed: -50 },
          } as ControllerOptions
        }
        initialViewState={{
          target: [
            0.5 * graphWidth + margin.left,
            0.5 * graphHeight + margin.top,
          ],
          zoom: [0, 0],
          minZoom: 0,
        }}
        onViewStateChange={({ viewState }) => {
          if (viewState) {
            setViewStateMonitor({
              pixelPosition: [viewState.target![0], viewState.target![1]],
              coordPosition: [
                viewPortScaleX.current!.invert(viewState.target![0]),
                viewPortScaleY.current!.invert(viewState.target![1]),
              ],
              zoom: viewState.zoom as [number, number],
            });

            return {
              ...viewState,
              target: [
                viewState.target![0] -
                  (graphWidth * 0.5) /
                    Math.pow(2, (viewState.zoom! as [number, number])[0]) <=
                viewPortBounds.pixel.x[0]
                  ? viewPortBounds.pixel.x[0] +
                    (graphWidth * 0.5) /
                      Math.pow(2, (viewState.zoom! as [number, number])[0])
                  : viewState.target![0] +
                        (graphWidth * 0.5) /
                          Math.pow(
                            2,
                            (viewState.zoom! as [number, number])[0],
                          ) >=
                      viewPortBounds.pixel.x[1]
                    ? viewPortBounds.pixel.x[1] -
                      (graphWidth * 0.5) /
                        Math.pow(2, (viewState.zoom! as [number, number])[0])
                    : viewState.target![0],
                viewState.target![1] - graphHeight * 0.5 <=
                viewPortBounds.pixel.y[0]
                  ? viewPortBounds.pixel.y[0] - graphHeight * 0.5
                  : viewState.target![1] + graphHeight * 0.5 >=
                      viewPortBounds.pixel.y[1]
                    ? viewPortBounds.pixel.y[1] + graphHeight * 0.5
                    : viewState.target![1],
              ],
            };
          }
        }}
        layers={layers}
      >
        {hoverInfo && <MapToolTip pickingInfo={hoverInfo} />}
      </DeckGL>
      <Grow
        in={
          appInterface.animationControlsVisible // &&
          //   (GPUfiltering.t[0] != bounds.x[0].getTime() ||
          //     GPUfiltering.t[1] != bounds.x[1].getTime())
        }
        style={{ transformOrigin: "bottom center" }}
        unmountOnExit
        mountOnEnter
      >
        <Paper
          sx={{
            p: 0.5,
            position: "absolute",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            zIndex: 1000,
            left: theme.spacing(2),
            bottom: `calc(100% + ${theme.spacing(2)})`,
          }}
        >
          <Checkbox
            size="small"
            checked={animationEnabled}
            onChange={() => {
              toggleAnimationEnabled();
            }}
            icon={<SelectionOff />}
            checkedIcon={<Selection />}
          />
          <IconButton
            onClick={() => {
              if (isPlaying == "stopped") {
                setIsPlaying("playing");
              } else {
                setIsPlaying("stopped");
              }
            }}
            size="small"
          >
            {isPlaying == "stopped" ? <PlayArrow /> : <Pause />}
          </IconButton>
          <Divider orientation="vertical" sx={{ m: 0.5, mr: 1 }} flexItem />
          <Speedometer sx={{ mr: 1 }} />
          <Input
            value={animationSpeed.multiplier}
            size="small"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setAnimationSpeed({
                multiplier: Number(event.target.value),
                unit: animationSpeed.unit,
              });
            }}
            sx={{ width: 36, alignSelf: "end", mb: "2px" }}
            inputProps={{
              step: 1,
              min: 0,
              max: 100,
              type: "number",
              "aria-labelledby": "input-slider",
            }}
          />
          <Select
            labelId="demo-simple-select-autowidth-label"
            id="demo-simple-select-autowidth"
            value={animationSpeed.unit}
            onChange={(event: SelectChangeEvent) => {
              setAnimationSpeed({
                multiplier: animationSpeed.multiplier,
                unit: event.target.value as
                  | "second"
                  | "minute"
                  | "hour"
                  | "day"
                  | "week"
                  | "year",
              });
            }}
            autoWidth
            label="Age"
            size="small"
            variant="standard"
            sx={{ alignSelf: "end", mb: "2px" }}
          >
            <MenuItem value="second">
              {animationSpeed.multiplier != 1
                ? t("Animation.seconds")
                : t("Animation.second")}
            </MenuItem>
            <MenuItem value="minute">
              {animationSpeed.multiplier != 1
                ? t("Animation.minutes")
                : t("Animation.minute")}
            </MenuItem>
            <MenuItem value="hour">
              {animationSpeed.multiplier != 1
                ? t("Animation.hours")
                : t("Animation.hour")}
            </MenuItem>
            <MenuItem value="day">
              {animationSpeed.multiplier != 1
                ? t("Animation.days")
                : t("Animation.day")}
            </MenuItem>
            <MenuItem value="week">
              {animationSpeed.multiplier != 1
                ? t("Animation.weeks")
                : t("Animation.week")}
            </MenuItem>
            <MenuItem value="year">
              {animationSpeed.multiplier != 1
                ? t("Animation.years")
                : t("Animation.year")}
            </MenuItem>
          </Select>
          {" /s"}
          <Divider orientation="vertical" sx={{ m: 0.5, ml: 1 }} flexItem />
          <Checkbox
            size="small"
            checked={tapered}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setTapered(event.target.checked);
            }}
            icon={<GradientHorizontal />}
            checkedIcon={<GradientHorizontal />}
          />
        </Paper>
      </Grow>
    </Box>
  );
}
