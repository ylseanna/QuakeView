/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { DataSource, EarthQuake } from "../datasource/types";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as d3 from "d3";

import {
  Box,
  Checkbox,
  IconButton,
  Paper,
  Skeleton,
  Slider,
  Input,
  Select,
  styled,
  Switch,
  Typography,
  useTheme,
  MenuItem,
  SelectChangeEvent,
  Grow,
  Divider,
} from "@mui/material";
import { ColorMapping } from "../datasource/formatting/color-mapping";
import { CheckBox, Pause, PlayArrow, RestartAlt } from "@mui/icons-material";
import { dataSourceDataUrl } from "../datasource/data-source-query";
import { useTranslations } from "next-intl";
import strftime from "strftime";
import useAnimationFrame from "use-animation-frame";
import { useProjectStore } from "@/providers/project-store-provider";
import { GradientHorizontal, Speedometer } from "mdi-material-ui";

type D3Earthquake = EarthQuake & { date: Date };

const NoAnimationSlider = styled(Slider)(() => ({
  "& .MuiSlider-thumb": {
    transition: "none",
  },
  "& .MuiSlider-track": {
    transition: "none",
  },
}));

export default function TimelineSlider({
  dataSources,
  setFiltering,
}: {
  dataSources: DataSource[];
  setFiltering?: CallableFunction;
}) {
  const t = useTranslations();
  const theme = useTheme();

  // Access state

  // animation

  const tapered = useProjectStore(
    (state) => state.sessionInterface.animation.tapered
  );
  const setTapered = useProjectStore(
    (state) => state.interfaceActions.animation.setTapered
  );
  const animationSpeed = useProjectStore(
    (state) => state.sessionInterface.animation.speed
  );
  const setAnimationSpeed = useProjectStore(
    (state) => state.interfaceActions.animation.setSpeed
  );

  // filtering

  const GPUfiltering = useProjectStore((state) => state.GPUfiltering);

  const setTimeFiltering = useProjectStore(
    (state) => state.GPUfilteringActions.setTimeFiltering
  );

  // DATA

  const [data, setData] = useState<D3Earthquake[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    d3.json(dataSourceDataUrl(dataSources[0]))
      .then((data) => {
        console.log("loading data");
        if (!data) {
          console.log("no data");
        } else {
          (data as D3Earthquake[]).forEach((d: D3Earthquake) => {
            const t = Math.round(d["t"] as number);
            d.date = new Date(t);
          });

          setData(data as D3Earthquake[]);
        }
      })
      .then(() => {
        setIsLoading(false);
      });
  }, [dataSources]); // Only load once

  // RESPONSIVE SIZING AND LOADING

  const parentRef = useRef<HTMLInputElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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

  const margin = { top: 8, right: 8, bottom: 24, left: 26 },
    width = dimensions.width,
    height = dimensions.height,
    dataMargin = { x: 0.002, y: 0.01 };

  // DATA BOUNDS

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

  const m_min = Math.min(
    ...dataSources.map(
      (dataSource) =>
        dataSource.metadata.data_descr.find((el) => el.variable == "mag")!
          .bounds[0]
    )
  );
  const m_max = Math.max(
    ...dataSources.map(
      (dataSource) =>
        dataSource.metadata.data_descr.find((el) => el.variable == "mag")!
          .bounds[1]
    )
  );

  const [localDomain, setLocalDomain] = useState<[number, number]>([
    t_min,
    t_max,
  ]);

  useEffect(() => {
    if (GPUfiltering.t[0] == 0 && GPUfiltering.t[1] == 2147483647) {
      setLocalDomain([t_min, t_max]);
      setTimeFiltering([t_min, t_max]);
    } else {
      setLocalDomain(GPUfiltering.t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  }, [animationSpeed]);

  useAnimationFrame((e) => {
    if (isPlaying == "playing") {
      const calcNewPosition = () => {
        if (localDomain[0] < t_max) {
          return [
            localDomain[0] + speed * e.delta * 1000,
            localDomain[1] + speed * e.delta * 1000,
          ] as [number, number];
        } else if (localDomain[0] >= t_max) {
          return [t_min - (localDomain[1] - localDomain[0]), t_min] as [
            number,
            number,
          ];
        }
      };

      setLocalDomain(calcNewPosition());
      setTimeFiltering(calcNewPosition());
    }
  });

  // SCALES

  // define scales
  const xScale = useMemo(
    () =>
      d3
        .scaleTime()
        .domain([
          new Date(t_min - dataMargin.x * (t_max - t_min)),
          new Date(t_max + dataMargin.x * (t_max - t_min)),
        ])
        .range([0, width - margin.right - margin.left]),
    [t_min, dataMargin.x, t_max, width, margin.right, margin.left]
  );
  const yScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([
          m_min - dataMargin.y * (m_max - m_min),
          m_max + dataMargin.y * (m_max - m_min),
        ] as Iterable<d3.NumberValue>)
        .range([height - margin.top - margin.bottom, 0]),
    [m_min, dataMargin.y, m_max, height, margin.top, margin.bottom]
  ).nice();

  // copy for zoom
  const xScaleOriginal = useMemo(() => xScale.copy(), [xScale]);
  const yScaleOriginal = useMemo(() => yScale.copy(), [yScale]);

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
        setLocalDomain([t_min, t_max]);
        setTimeFiltering([t_min, t_max]);
      } else {
        const newValue = [
          xScale.invert(selection[0] as number).getTime(),
          xScale.invert(selection[1] as number).getTime(),
        ];

        setLocalDomain(newValue as [number, number]);
        setTimeFiltering(newValue as [number, number]);
      }
    },
    [isPlaying, setTimeFiltering, t_max, t_min, xScale]
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
    [isPlaying]
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
    (newDomain) => {
      const brush = brushRef.current;
      if (brush) {
        d3.select("#timeline-graph")
          .select(".brush")
          .call(brush.move as any, [
            newDomain[0] >= t_min ? xScale(newDomain[0]) : xScale(t_min),
            newDomain[1] <= t_max ? xScale(newDomain[1]) : xScale(t_max),
          ]);
      }
    },
    [t_max, t_min, xScale]
  );

  // initial move
  useEffect(() => {
    if (!(localDomain[0] === t_min && localDomain[1] === t_max)) {
      moveBrush(localDomain);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // change listener, i.e. sync d3 and slider
  useEffect(() => {
    if (!(localDomain[0] === t_min && localDomain[1] === t_max)) {
      moveBrush(localDomain);
    }
  }, [localDomain, moveBrush, t_max, t_min]);

  const drawPoint = useCallback(
    (context: CanvasRenderingContext2D, d: D3Earthquake) => {
      context.beginPath();

      const clr = ColorMapping(d, dataSources[0].formatting.color)!;
      context.fillStyle = `rgb(${clr[0]},${clr[1]},${clr[2]})`;
      const px = xScale(d.date);
      const py = yScale(d.mag);

      context.arc(px, py, 1.2, 0, 2 * Math.PI, true);
      context.fill();
    },
    [dataSources, xScale, yScale]
  );

  // draw points
  const draw = useCallback(() => {
    console.log("draw called");

    const context = contextRef.current!;

    if (data && context) {
      // context.clearRect(0, 0, width, height);

      (data as D3Earthquake[]).forEach((d) => {
        drawPoint(context, d);
      });
    }
  }, [data, drawPoint]);

  // Define and generate plots
  const contextRef = useRef<CanvasRenderingContext2D>(null);

  useEffect(() => {
    d3.select("#timeline-graph").select("svg").remove();
    d3.select("#timeline-graph").select("canvas").remove();

    const container = d3.select("#timeline-graph");

    const canvas = container
      .append("canvas")
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("margin-left", margin.left + "px")
      .style("margin-top", margin.top + "px");

    // append the svg object to the body of the page
    const svg = container
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .property("value", []);

    const context = canvas.node()!.getContext("2d")!;

    contextRef.current = context;

    // ADD X-AXIS
    const xAxes = g
      .append("g")
      .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
      .call(
        d3.axisBottom(xScale)
        // .tickFormat(() => "")
      );

    xAxes.selectAll("line").attr("stroke-opacity", 0.6);

    //ADD Y-AXIS
    const yAxes = g.append("g").attr("transform", `translate(0, 0)`).call(
      d3.axisLeft(yScale)
      // .tickFormat(() => "")
    );
    yAxes.selectAll("line").attr("stroke-opacity", 0.6);

    // BRUSH

    // create the d3-brush generator
    const brush = d3
      .brushX()
      .extent([
        [0, 0],
        [
          width - margin.left - margin.right,
          height - margin.bottom - margin.top,
        ],
      ])
      .on("start", onBrushStart)
      .on("brush", onBrush)
      .on("end", onBrush);

    // attach the brush to the chart
    g.append("g").attr("class", "brush").call(brush);

    brushRef.current = brush;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions]);

  // listen for initial draw and subsequent draws
  useEffect(() => {
    if (data) {
      draw();
    }
  }, [draw, data, width]);

  return (
    <>
      <div
        style={{
          position: "relative",
          height: "100%",
          width: "100%",
        }}
      >
        <Box
          ref={parentRef}
          id="timeline-graph"
          sx={{
            position: "relative",
            height: "100%",
            width: "100%",
            margin: "-8px",
            top: 8,
            left: 8,
            ".brush .selection": {
              strokeWidth: 0,
              fill: (theme) => theme.palette.primary.main,
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

        {/* <NoAnimationSlider
        value={localDomain}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => {
          const time = strftime(
            `%Y-%m-%d, %T, ${t("Locale.day")} %j`,
            new Date(value)
          );
          return <Typography fontSize={10}>{time}</Typography>;
        }}
        min={t_min}
        max={t_max}
        // step={step}
        // marks={marks}
        onChange={(event: Event, newValue: number | number[]) => {
          setLocalDomain(newValue as [number, number]);
          GPUfilteringActions.setTimeFiltering([t_min, t_max]);
        }}
        size="small"
        // onChangeCommitted={onChangeCommitted}
        sx={{
          position: "absolute",
          left: margin.left + "px",
          bottom: "1px",
          width: dimensions.width - margin.left - margin.right,
          ".MuiSlider-thumb" : {
            display: "none",
          }
        }}
      /> */}
      </div>
      <Grow
        in={GPUfiltering.t[0] != t_min || GPUfiltering.t[1] != t_max}
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
          <Divider orientation="vertical" sx={{ m: 0.5, mr:1 }} flexItem/>
          <Speedometer sx={{mr:1}}/>
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
          </Select>{" /s"}
          <Divider orientation="vertical" sx={{ m: 0.5, ml: 1 }} flexItem/>
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
    </>
  );
}
