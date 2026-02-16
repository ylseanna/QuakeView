import useAnimationFrame from "use-animation-frame";

/* eslint-disable react-hooks/exhaustive-deps */
import DeckGL from "@deck.gl/react";
import { Box } from "@mui/material";
import * as d3 from "d3";
import { OrthographicView, PickingInfo, ScatterplotLayer } from "deck.gl";
import {
  Dispatch,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useProjectStore } from "@/providers/project-store-provider";
import { StemPlotLayers } from "../map/generate-datasource-layers";
// import { fetchData } from "../datasource/load-data";
// import { useDataStore } from "@/providers/data-store-provider";
import { SetStateAction } from "react";
import { EarthQuake } from "../datasource/types";
import { useData } from "../datasource/use-data";
import { minorTimeFormat } from "../interface/time-format";
import MapToolTip from "../map/map-tooltip";
import { ControllerOptions } from "../map/types";
// import { useKeyPressed } from "@react-hooks-library/core";

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

export default function TimelineSlider({
  isPlaying,
  setIsPlaying,
}: {
  isPlaying: "playing" | "paused" | "stopped";
  setIsPlaying: Dispatch<SetStateAction<"playing" | "paused" | "stopped">>;
}) {
  // const t = useTranslations();
  // const theme = useTheme();
  // TOOLTIP
  const sessionInterface = useProjectStore((state) => state.sessionInterface);

  // const { appInterface } = useAppStateStore((state) => state);

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

  const { enabled: animationEnabled, speed: animationSpeed } = useProjectStore(
    (state) => state.sessionInterface.animation.timeline,
  );

  // state for setting dimensions of graph in container
  const parentRef = useRef<HTMLInputElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const [viewStateMonitor, setViewStateMonitor] = useState<ViewStateMonitor>({
    pixelPosition: [0, 0],
    coordPosition: [new Date(1970, 1, 1), 0],
    zoom: [0, 0],
  });

  // useKeyPressed("space", () => {
  //   if (isPlaying == "paused" || isPlaying == "stopped") {
  //     setIsPlaying("playing");
  //   } else {
  //     setIsPlaying("stopped");
  //   }
  // });

  // graph bounds and viewstate (for compare to deck.gl instance)
  // const [graphViewState, setGraphViewState] = useState<ViewStateMonitor>({
  //   pixelPosition: [0, 0],
  //   coordPosition: [new Date(1970, 1, 1), 0],
  //   zoom: [0, 0],
  // });

  const [bounds, setBounds] = useState<Bounds>({
    x: [new Date(1970, 1, 1), new Date(2025, 1, 1)],
    y: [0, 1],
  });

  // graph constants
  const margin = { top: 16, right: 16, bottom: 40, left: 44 };

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

  const minorFormat = useMemo(
    () =>
      minorTimeFormat((bounds.x![1].valueOf() - bounds.x![0].valueOf()) / 1000),
    [bounds.x],
  );

  useEffect(() => {
    if (GPUfiltering.t[0] == 0 && GPUfiltering.t[1] == 2147483647) {
      setLocalDomain([bounds.x[0].getTime(), bounds.x[1].getTime()]);
      setTimeFiltering([bounds.x[0].getTime(), bounds.x[1].getTime()]);
    } else {
      setLocalDomain(GPUfiltering.t as [number, number]);
    }
  }, []);

  // ANIMATION

  // const [isPlaying, setIsPlaying] = useState<string>("stopped");

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

  // brush element
  const brushG =
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

  useEffect(() => {
    if (!animationEnabled) {
      // setLocalDomain([bounds.x[0].getTime(), bounds.x[1].getTime()]);
      setTimeFiltering([bounds.x[0].getTime(), bounds.x[1].getTime()]);
      if (isPlaying == "playing") {
        setIsPlaying("paused");
      }
      // setTapered(false);

      if (brushG.current) {
        brushG.current.call(brushRef.current!.move, null);
      }
    } else {
      if (
        Math.round(localDomain[0]) != Math.round(bounds.x[0].valueOf()) ||
        Math.round(localDomain[1]) != Math.round(bounds.x[1].valueOf())
      ) {
        setTimeFiltering(localDomain);
        moveBrush(localDomain);
      }
      if (isPlaying == "paused") {
        setIsPlaying("playing");
      }
    }
  }, [animationEnabled]);

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
      .range([height - margin.bottom, margin.top])
      .nice();

    // x axes
    xAxes.current = SVG.current
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .style("font-size", ".9rem")
      .call(d3.axisBottom(scaleX.current).tickFormat(minorFormat));

    // // x axes label
    SVG.current
      .append("text")
      .attr("x", graphWidth / 2)
      .attr("y", height - 5)
      .attr("dx", margin.left)
      .attr("font-size", ".95rem")
      .attr("text-anchor", "middle")
      .text("Year");

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
      .attr("x", -(graphHeight / 2 + margin.top))
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
    brushG.current = SVG.current!.append("g")
      .attr("class", "brush")
      .call(brush);

    brushRef.current = brush;

    // setIsLoading(true);
  }, [dimensions, margin.bottom, margin.left, margin.right, margin.top]);

  // set bounds based on ViewState
  useEffect(() => {
    if (viewPortScaleX.current && viewPortScaleY.current) {
      // calculate current bounds after transform (useEffect listens to change in viewPortMonitor)
      let newXBounds = [
        viewPortScaleX.current.invert(
          viewStateMonitor.pixelPosition[0] -
            (graphWidth * 0.5) / Math.pow(2, viewStateMonitor.zoom[0]),
        ),
        viewPortScaleX.current.invert(
          viewStateMonitor.pixelPosition[0] +
            (graphWidth * 0.5) / Math.pow(2, viewStateMonitor.zoom[0]),
        ),
      ] as [Date, Date];

      if (
        newXBounds[0] < viewPortBounds.coord.x[0] // &&
      ) {
        newXBounds = [viewPortBounds.coord.x[0], bounds.x[1]];
      } else if (
        newXBounds[1] > viewPortBounds.coord.x[1] // &&
      ) {
        newXBounds = [bounds.x[0], viewPortBounds.coord.x[1]];
      }

      // catch max zoom to avoid some jittering

      if (viewStateMonitor.zoom[0] == 0) {
        newXBounds = viewPortBounds.coord.x;
      }

      // update bounds for all listeners (see below)
      setBounds({
        x: newXBounds,
        y: bounds.y,
      });
    }
  }, [viewStateMonitor.coordPosition, viewStateMonitor.pixelPosition]);

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
  }, [dimensions, dataSources.byID, data, scaleX, scaleY, sessionInterface]);

  const resetAxes = useCallback(() => {
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

    setBounds({
      x: [new Date(minX), new Date(maxX)],
      y: [minY, maxY],
    });

    console.log(bounds);

    // time filtering (make option)
    setTimeFiltering([bounds.x[0].getTime(), bounds.x[1].getTime()]);

    // scale
    scaleX.current!.domain(bounds.x);

    // update X axes and grid based on scale
    xAxes
      .current!.transition()
      .duration(0.0000001)
      .ease(d3.easeLinear)
      .call(d3.axisBottom(scaleX.current!).tickFormat(minorFormat));
    xAxesGrid
      .current!.transition()
      .duration(0.0000001)
      .ease(d3.easeLinear)
      .call(
        d3
          .axisBottom(scaleX.current!)
          .tickFormat(() => "")
          .tickSize(-graphHeight),
      );
  }, [data]);

  // initial setting
  useEffect(() => {
    resetAxes();
  }, []);

  // reset based on data change
  useEffect(() => {
    resetAxes();
  }, [data]);

  //  listen for viewport changes
  useEffect(() => {
    if (viewPortScaleX.current && viewPortScaleY.current) {
      // time filtering (make option)
      setTimeFiltering([bounds.x[0].getTime(), bounds.x[1].getTime()]);

      // scale
      scaleX.current!.domain(bounds.x);
      scaleY.current!.domain(bounds.y);

      // update X axes and grid based on scale
      xAxes
        .current!.transition()
        .duration(0.0000001)
        .ease(d3.easeLinear)
        .call(d3.axisBottom(scaleX.current!).tickFormat(minorFormat));
      xAxesGrid
        .current!.transition()
        .duration(0.0000001)
        .ease(d3.easeLinear)
        .call(
          d3
            .axisBottom(scaleX.current!)
            .tickFormat(() => "")
            .tickSize(-graphHeight),
        );
    }
  }, [bounds.x]);

  //  listen for viewport changes
  useEffect(() => {
    if (viewPortScaleX.current && viewPortScaleY.current) {
      // scale
      scaleY.current!.domain(bounds.y).nice();

      // update X axes and grid based on scale
      yAxes.current!.transition().call(d3.axisLeft(scaleY.current!));
      yAxesGrid.current!.transition().call(
        d3
          .axisLeft(scaleY.current!)
          .tickFormat(() => "")
          .tickSize(-graphWidth),
      );
    }
  }, [bounds.y]);

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
            scrollZoom: { speed: 0.1, smooth: true },
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
    </Box>
  );
}
