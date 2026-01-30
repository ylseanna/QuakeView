// import { DataFilterExtension } from "@deck.gl/extensions";
import DeckGL from "@deck.gl/react";
/* eslint-disable react-hooks/exhaustive-deps */
import { Box } from "@mui/material";
import { OrthographicView, PickingInfo } from "deck.gl";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

import { useProjectStore } from "@/providers/project-store-provider";
import { generateDataSourcePlotLayers } from "../map/generate-datasource-layers";
import { useDataStore } from "@/providers/data-store-provider";
import { EarthQuake } from "../datasource/types";
import MapToolTip from "../map/map-tooltip";
import { ControllerOptions } from "../map/types";
interface Bounds {
  x: [Date, Date];
  y: [number, number];
}

interface ViewStateMonitor {
  pixelPosition: [number, number];
  coordPosition: [Date, number];
  zoom: [number, number];
}

export default function StemPlot() {
  // TOOLTIP
  const sessionInterface = useProjectStore((state) => state.sessionInterface);

  const [hoverInfo, setHoverInfo] = useState<PickingInfo<EarthQuake>>();
  // app stores
  const { dataSources } = useProjectStore((state) => state);
  // const { GPUfiltering } = useProjectStore((state) => state);
  const { data } = useDataStore((state) => state);

  // state for setting dimensions of graph in container
  const parentRef = useRef<HTMLInputElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  // const [isLoading, setIsLoading] = useState(true);
  // const [layers, setLayers] = useState<LayersList>([]);

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

  useLayoutEffect(() => {
    if (parentRef.current) {
      setDimensions({
        width: parentRef.current.offsetWidth,
        height: parentRef.current.offsetHeight,
      });
    }
    console.log(dimensions);
  }, []);

  // init graph
  useEffect(() => {
    const width = dimensions.width,
      height = dimensions.width * height_to_width_ratio;

    d3.select("#chart-stem-plot").select("svg").remove();
    // d3.select("#chart-stem-plot").select("canvas").remove();
    // set the dimensions and margins of the graph

    // append the svg object to the body of the page
    SVG.current = d3
      .select("#chart-stem-plot")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g");
    // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // const canvas = d3
    //   .select("#chart-stem-plot")
    //   .append("canvas")
    //   .style("position", "absolute")
    //   .style("top", 2 * margin.top + 1 + "px")
    //   .style("left", 2 * margin.left + 1 + "px")
    //   .attr("width", width - (2 * margin.left + margin.right) - 1)
    //   .attr("height", height - (margin.top + margin.bottom) - 1);

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
  }, [dimensions, margin.bottom, margin.left, margin.right, margin.top, data]);

  // // set layers
  // useEffect(() => {
  //   dataSources.allIDs.map((dataSourceID) => {
  //     if (data[dataSourceID]) {
  //       // const platform = Stardust.platform("webgl-2d", canvas, width, height);

  //       setIsLoading(true);

  //       const dataSourceData = data[dataSourceID].data;
  //       const dataSource = dataSources.byID[dataSourceID];

  //       const layers = [
  //         new ScatterplotLayer({
  //           id: `plotLayer_${dataSource.internal_id}_${JSON.stringify(dataSource.formatting.color)}`, // absolutely stupid way of making it listen to a color state update and forcing a rerender
  //           data: dataSourceData,
  //           getRadius: 0.1,
  //           radiusScale: dataSource.formatting.scale,
  //           getPosition: (d: EarthQuake) => [
  //             scaleX.current!(d.t),
  //             scaleY.current!(d.mag),
  //           ],
  //           getFillColor: (d: EarthQuake) =>
  //             ColorMapping(d, dataSource.formatting.color) as Color,
  //           autoHighlight: true,
  //           highlightColor: [255, 255, 255, 140],
  //           colorFormat: "RGB",
  //           opacity: dataSource.formatting.opacity / 100,
  //           stroked: false,
  //           getLineColor: [255, 255, 255, 0.5 * 255],
  //           lineWidthUnits: "pixels",
  //           billboard: true,
  //           antialiasing: dataSource.formatting.antialiasing,
  //           pickable: dataSource.interface.pickable,
  //           transitions: {
  //             getPosition: { type: "spring", stiffness: 0.01, damping: 0.2 },
  //           },
  //           // getFilterValue: (d: EarthQuake) => [d.mag, d.t],
  //           // filterSoftRange: [
  //           //  GPUfiltering.mag as [number, number],
  //           //   [
  //           //     sessionInterface.animation.tapered
  //           //       ? (GPUfiltering.t[1] as number)
  //           //       : (GPUfiltering.t[0] as number),
  //           //     GPUfiltering.t[1] as number,
  //           //   ],
  //           // ],
  //           // filterTransformSize: true,
  //           // filterTransformColor: false,
  //           // filterRange: [
  //           //   GPUfiltering.mag as [number, number],
  //           //   GPUfiltering.t as [number, number],
  //           // ],
  //           // extensions: [
  //           //   new DataFilterExtension({ filterSize: 2, fp64: true }),
  //           // ],
  //         }),
  //       ];

  //       // setLayers(layers);
  //       setIsLoading(false);
  //     }
  //   });
  // }, [data, dataSources.allIDs]);

  const layers = useMemo(() => {
    if (scaleX.current && scaleY.current) {
      const layers_to_set = dataSources.allIDs.map((id) => {
        viewPortScaleX.current = d3
          .scaleUtc()
          .domain(
            dataSources.byID[id].metadata.variables.by_id["t"]
              .bounds as Iterable<d3.NumberValue>,
          )
          .range([margin.left, graphWidth + margin.left]);

        viewPortScaleY.current = d3
          .scaleLinear()
          .domain(
            dataSources.byID[id].metadata.variables.by_id["mag"]
              .bounds as Iterable<d3.NumberValue>,
          )
          .range([graphHeight + margin.top, margin.top]);

        if (data[id]) {
          const layer = generateDataSourcePlotLayers(
            dataSources.byID[id],
            data[id].data,
            sessionInterface,
            viewPortScaleX.current,
            viewPortScaleY.current,
          );

          layer.onHover = (info: PickingInfo<EarthQuake>) => {
            setHoverInfo(info);
            return true;
          };

          return layer;
        }
      });

      console.log(layers_to_set);

      return layers_to_set;
    }
  }, [
    dataSources.allIDs,
    dataSources.byID,
    data,
    scaleX,
    scaleY,
    sessionInterface,
  ]);

  // set bounds
  useEffect(() => {
    dataSources.allIDs.map((dataSourceID) => {
      const dataSource = dataSources.byID[dataSourceID];

      setBounds({
        x: [
          new Date(dataSource.metadata.variables.by_id["t"].bounds[0]),
          new Date(dataSource.metadata.variables.by_id["t"].bounds[1]),
        ],
        y: dataSource.metadata.variables.by_id["mag"].bounds,
      });
    });
  }, [data, dataSources.allIDs]);

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

    // update Y axes and grid
    yAxes.current?.transition().duration(10).call(d3.axisLeft(scaleY.current!));
    yAxesGrid.current
      ?.transition()
      .duration(10)
      .call(
        d3
          .axisLeft(scaleY.current!)
          .tickFormat(() => "")
          .tickSize(-graphWidth),
      );
  }, [bounds]);

  return (
    <Box
      style={{
        position: "relative",
        display: "block",
        minHeight: `calc(${height_to_width_ratio} * ${dimensions.width}px)`,
      }}
    >
      <Box ref={parentRef} id="chart-stem-plot" sx={{ position: "relative" }}>
        {/* {isLoading && (
          <Skeleton
            sx={{
              position: "absolute",
              top: 2 * margin.top + "px",
              left: 2 * margin.left + "px",
            }}
            variant="rectangular"
            width={dimensions.width - margin.left * 2 - margin.right}
            height={
              dimensions.width * height_to_width_ratio -
              margin.top -
              margin.bottom
            }
          />
        )} */}
        <DeckGL
          style={{
            position: "absolute",
            width: graphWidth + "px",
            height: graphHeight + "px",
            top: margin.top + "px",
            left: margin.left + "px",
            cursor: sessionInterface.pickable ? "crosshair" : "auto",
          }}
          views={
            new OrthographicView({
              width: graphWidth,
              height: graphHeight,
            })
          }
          controller={
            {
              zoomAxis: "X",
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
            }
          }}
          layers={layers}
        >
          {hoverInfo && <MapToolTip pickingInfo={hoverInfo} />}
        </DeckGL>
        <Box sx={{ position: "fixed" }}>
          <span>
            {viewStateMonitor.pixelPosition[0]},{" "}
            {viewStateMonitor.pixelPosition[1]}
          </span>
          <br />
          <span>
            {viewStateMonitor.coordPosition[0].toISOString()},{" "}
            {viewStateMonitor.coordPosition[1]}
          </span>
          <br />
          <span>{viewStateMonitor.zoom[0]}</span>
        </Box>
      </Box>
    </Box>
  );
}
