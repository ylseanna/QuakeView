// import { DataFilterExtension } from "@deck.gl/extensions";
import DeckGL from "@deck.gl/react";
/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Skeleton } from "@mui/material";
import { OrthographicView, PickingInfo } from "deck.gl";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

import { useProjectStore } from "@/providers/project-store-provider";
import { generateDataSourcePlotLayers } from "../map/generate-datasource-layers";
import { useDataStore } from "@/providers/data-store-provider";
import { EarthQuake } from "../datasource/types";
import MapToolTip from "../map/map-tooltip";
interface Bounds {
  x: [number, number];
  y: [number, number];
}

export default function StemPlot() {
  // TOOLTIP

  const [hoverInfo, setHoverInfo] = useState<PickingInfo<EarthQuake>>();
  // app stores
  const { dataSources } = useProjectStore((state) => state);
  // const { GPUfiltering } = useProjectStore((state) => state);
  const { data } = useDataStore((state) => state);

  // state for setting dimensions of graph in container
  const parentRef = useRef<HTMLInputElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  // const [layers, setLayers] = useState<LayersList>([]);

  // graph specific data
  const [bounds, setBounds] = useState<Bounds>({ x: [0, 1], y: [0, 1] });

  // graph constants
  const margin = { top: 2, right: 10, bottom: 40, left: 26 },
    height_to_width_ratio = 0.3,
    width = dimensions.width,
    height = dimensions.width * height_to_width_ratio;

  // graph elements (store statically in component)
  // svg element
  const SVG =
    useRef<d3.Selection<SVGGElement, unknown, HTMLElement, unknown>>(null);
  // scales
  const scaleX = useRef<d3.ScaleLinear<number, number, never>>(null),
    scaleY = useRef<d3.ScaleLinear<number, number, never>>(null);
  // axes
  const xAxes =
      useRef<d3.Selection<SVGGElement, unknown, HTMLElement, unknown>>(null),
    yAxes =
      useRef<d3.Selection<SVGGElement, unknown, HTMLElement, unknown>>(null);

  useLayoutEffect(() => {
    if (parentRef.current) {
      setDimensions({
        width: parentRef.current.offsetWidth,
        height: parentRef.current.offsetHeight,
      });
    }
  }, []);

  // init graph
  useEffect(() => {
    d3.select("#chart-stem-plot").select("svg").remove();
    // d3.select("#chart-stem-plot").select("canvas").remove();
    // set the dimensions and margins of the graph

    // append the svg object to the body of the page
    SVG.current = d3
      .select("#chart-stem-plot")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // const canvas = d3
    //   .select("#chart-stem-plot")
    //   .append("canvas")
    //   .style("position", "absolute")
    //   .style("top", 2 * margin.top + 1 + "px")
    //   .style("left", 2 * margin.left + 1 + "px")
    //   .attr("width", width - (2 * margin.left + margin.right) - 1)
    //   .attr("height", height - (margin.top + margin.bottom) - 1);

    scaleX.current = d3
      .scaleLinear()
      .domain([bounds.x[0], bounds.x[1]] as Iterable<d3.NumberValue>)
      .range([margin.left, width - margin.right - margin.left])
      .nice();

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
      .call(d3.axisBottom(scaleX.current));

    // x axes label
    SVG.current
      .append("text")
      .attr("x", (width - margin.left - margin.right) / 2)
      .attr("y", height - margin.top - 4)
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
      .attr("y", -margin.left) // Relative to the y axis.
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
      .attr("transform", `translate(${width - margin.left - margin.right}, 0)`)
      .call(d3.axisRight(scaleY.current).tickSize(0).tickValues([]));

    setIsLoading(true);
  }, [
    height,
    margin.bottom,
    margin.left,
    margin.right,
    margin.top,
    width,
    data,
  ]);

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
    const layers_to_set = dataSources.allIDs.map((id) => {
      if (data[id]) {
        const layer = generateDataSourcePlotLayers(
          dataSources.byID[id],
          data[id].data,
          scaleX.current!,
          scaleY.current!,
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
  }, [
    dataSources.allIDs,
    dataSources.byID,
    data,
  ]);

  // set bounds
  useEffect(() => {
    dataSources.allIDs.map((dataSourceID) => {
      const dataSource = dataSources.byID[dataSourceID];

      setBounds({
        x: dataSource.metadata.variables.by_id["t"].bounds,
        y: dataSource.metadata.variables.by_id["mag"].bounds,
      });
    });
  }, [data, dataSources.allIDs]);

  // update bounds in DOM
  useEffect(() => {
    // update domains on scales
    scaleX.current!.domain(bounds.x).nice();
    scaleY.current!.domain(bounds.y).nice();

    // update axes with scales
    xAxes.current?.transition().call(d3.axisBottom(scaleX.current!));
    yAxes.current?.transition().call(d3.axisLeft(scaleY.current!));

    // Add vertical gridlines
    SVG.current!.selectAll("line.vertical-grid")
      .data(scaleX.current!.ticks())
      .enter()
      .append("line")
      .attr("class", "vertical-grid")
      .attr("x1", function (d) {
        return scaleX.current!(d);
      })
      .attr("y1", margin.top)
      .attr("x2", function (d) {
        return scaleX.current!(d);
      })
      .attr("y2", height - margin.bottom)
      .style("stroke", "gray")
      .style("stroke-width", 0.5)
      .style("stroke-dasharray", "2 2");

    // Add horizontal gridlines
    SVG.current!.selectAll("line.horizontal-grid")
      .data(scaleY.current!.ticks())
      .enter()
      .append("line")
      .attr("class", "horizontal-grid")
      .attr("x1", margin.left)
      .attr("y1", function (d) {
        return scaleY.current!(d);
      })
      .attr("x2", width - margin.right - margin.left)
      .attr("y2", function (d) {
        return scaleY.current!(d);
      })
      .style("stroke", "gray")
      .style("stroke-width", 0.5)
      .style("stroke-dasharray", "2 2");
  }, [bounds]);

  return (
    <Box
      style={{
        position: "relative",
        display: "block",
        minHeight: `calc(${height_to_width_ratio}* ${width}px)`,
      }}
    >
      <Box ref={parentRef} id="chart-stem-plot" sx={{ position: "relative" }}>
        {isLoading && (
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
        )}
        <DeckGL
          style={{
            // position: "absolute",
            top: 2 * margin.top + "px",
            left: 2 * margin.left + "px",
          }}
          views={
            new OrthographicView({
              width: dimensions.width - margin.left * 2 - margin.right,
              height:
                dimensions.width * height_to_width_ratio -
                margin.top -
                margin.bottom,
            })
          }
          controller={{
            zoomAxis: "X",
            bounds: [bounds.x[0], bounds.x[1], bounds.y[0], bounds.y[1]],
          }}
          initialViewState={{
            target: [
              0.5 * dimensions.width - margin.left * 2 - margin.right,
              0.5 * dimensions.width * height_to_width_ratio -
                margin.top -
                margin.bottom,
              0,
            ],
            zoom: [0, 0],
            minZoom: 0,
          }}
          layers={layers}
        />
        {hoverInfo && (
                <MapToolTip pickingInfo={hoverInfo}/>
              )}{" "}
      </Box>
    </Box>
  );
}
