/* eslint-disable react-hooks/exhaustive-deps */
import DeckGL from "@deck.gl/react";
import { Box } from "@mui/material";
import { OrthographicView, PickingInfo, ScatterplotLayer } from "deck.gl";
import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

import { useProjectStore } from "@/providers/project-store-provider";
import MapToolTip from "../map/map-tooltip";
import { useStemPlotLayers } from "../map/use-layers";
// import { fetchData } from "../datasource/load-data";
// import { useDataStore } from "@/providers/data-store-provider";
import { useCatalogData } from "../data/use-data";
import { Earthquake } from "../custom/types";
import { ControllerOptions } from "../map/types";
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

export default function StemPlot() {
  // TOOLTIP
  const sessionInterface = useProjectStore((state) => state.sessionInterface);

  const [hoverInfo, setHoverInfo] = useState<PickingInfo<Earthquake>>();
  // app stores
  const { dataSources } = useProjectStore((state) => state);
  const { data } = useCatalogData();

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
  const margin = { top: 16, right: 16, bottom: 40, left: 56 },
    height_to_width_ratio = 0.2;

  const graphWidth = useMemo(
    () => dimensions.width - margin.left - margin.right,
    [dimensions],
  );
  const graphHeight = useMemo(
    () => dimensions.width * height_to_width_ratio - margin.top - margin.bottom,
    [dimensions],
  );

  const [viewPortBounds, setViewPortBounds] = useState<ViewPortBounds>({
    pixel: { x: [0, graphWidth], y: [0, graphHeight] },
    coord: { x: [new Date(1970, 1, 1), new Date(2025, 1, 1)], y: [0, 1] },
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

  // init graph
  useEffect(() => {
    const width = dimensions.width,
      height = dimensions.width * height_to_width_ratio;

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
      .attr("y", height - 4)
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
      .attr("y", 0) // Relative to the y axis.
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
    }
  }, [viewStateMonitor]);

  // update bounds in DOM
  useEffect(() => {
    // update domains on scales
    scaleX.current!.domain(bounds.x);
    scaleY.current!.domain(bounds.y);

    if (
      !(scaleX.current!.domain()[0] < viewPortBounds.coord.x[0]) &&
      !(scaleX.current!.domain()[1] > viewPortBounds.coord.x[1]) &&
      !(viewStateMonitor.zoom[0] == 0)
    ) {
      // update X axes and grid
      xAxes.current
        ?.transition()
        .duration(10)
        .call(d3.axisBottom(scaleX.current!));
      xAxesGrid.current
        ?.transition()
        .duration(10)
        .call(
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
  }, [bounds, dimensions]);

  useEffect(() => {
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

  const layers = useStemPlotLayers(
    viewPortScaleX.current,
    viewPortScaleY.current,
    0,
    false,
  );

  useEffect(() => {
    if (layers) {
      layers.forEach((layer) => {
        layer!.onHover = (info: PickingInfo<Earthquake>) => {
          setHoverInfo(info);
          return true;
        };
      });
    }
  }, [layers]);

  return (
    <Box
      style={{
        position: "relative",
        display: "block",
        minHeight: `calc(${height_to_width_ratio} * ${dimensions.width}px)`,
      }}
    >
      <Box ref={parentRef} id="chart-stem-plot" sx={{ position: "relative" }}>
        <DeckGL
          style={{
            position: "absolute",
            width: graphWidth + "px",
            height: graphHeight + "px",
            top: margin.top + "px",
            left: margin.left + "px",
            cursor: sessionInterface.pickable ? "crosshair" : "auto",
          }}
          useDevicePixels={false}
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
      </Box>
    </Box>
  );
}
