/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Skeleton } from "@mui/material";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as d3 from "d3";

import { useProjectStore } from "@/providers/project-store-provider";
import { useDataStore } from "@/providers/data-store-provider";
import { EarthQuake } from "../datasource/types";

interface Bounds {
  x: [number, number];
  y: [number, number];
}

export default function StemPlot() {
  // app stores
  const { dataSources } = useProjectStore((state) => state);
  const { data } = useDataStore((state) => state);

  // state for setting dimensions of graph in container
  const parentRef = useRef<HTMLInputElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // graph specific data
  const [bounds, setBounds] = useState<Bounds>({ x: [0, 1], y: [0, 1] });

  // graph constants
  const margin = { top: 2, right: 10, bottom: 40, left: 26 },
    width = dimensions.width,
    height = dimensions.width * 0.5;

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
    // set the dimensions and margins of the graph

    // append the svg object to the body of the page
    SVG.current = d3
      .select("#chart-stem-plot")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // find overall bounds

    // const overallYbounds = [
    //   d3.min(pointData, (d) => d.ybounds[0]),
    //   d3.max(pointData, (d) => d.ybounds[1]),
    // ];

    // const overallXbounds = [
    //   d3.min(pointData, (d) => d.xbounds[0]),
    //   d3.max(pointData, (d) => d.xbounds[1]),
    // ];

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
      .text("Magnitude");

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
      .text("log\u2081\u2080\u004E(≥M)");

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

    // yAxes.selectAll("line").attr("stroke-opacity", 0.6);
    // xAxes.selectAll("line").attr("stroke-opacity", 0.6);

    // for (let i = 0; i < pointData.length; i++) {
    //   const dataSourcePointData = pointData[i];

    //   // const dataSource = dataSources.byID[dataSourcePointData.id];

    //   console.log(dataSourcePointData);

    //   // chartSVG.current
    //   //   .append("g")
    //   //   .selectAll("dot")
    //   //   .data(dataSourcePointData.mags)
    //   //   .enter()
    //   //   .append("circle")
    //   //   .attr("cx", (d) => x(d))
    //   //   .attr("cy", (d, i) => y(i + 1))
    //   //   .attr("r", 1.5)
    //   //   .style("fill", dataSource.formatting.color.single);

    //   setIsLoading(false);
    // }
  }, [height, margin.bottom, margin.left, margin.right, margin.top, width]);

  // set bounds
  useEffect(() => {
    for (let i = 0; i < dataSources.allIDs.length; i++) {
      const dataSourceID = dataSources.allIDs[i];

      const xMin = bounds.x[0]
      const xMax = bounds.x[1]

      const yMin = bounds.y[0]
      const yMax = bounds.y[1]

      if (data[dataSourceID]) {
        const mags = (data[dataSourceID].data as EarthQuake[])
          .map((d) => d["mag"])
          .toSorted((a, b) => a - b)
          .reverse() as number[];

        console.log(mags);

        const xbounds = [d3.min(mags), d3.max(mags)] as [number, number];

        const ybounds = [1, mags.length] as [number, number];

        
      }

      setBounds({ x: [xMin, xMax], y: [yMin, yMax] });
    }
  }, [data, dataSources.allIDs]);

  // update bounds in DOM
  useEffect(() => {
    // update domains on scales
    scaleX.current!.domain(bounds.x).nice();
    scaleY.current!.domain(bounds.y).nice();

    // update axes with scales
    xAxes.current
      ?.transition()
      .call(d3.axisBottom(scaleX.current!));
    yAxes.current
      ?.transition()
      .call(d3.axisLeft(scaleY.current!));

      // Add vertical gridlines
    SVG.current!
      .selectAll("line.vertical-grid")
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
    SVG.current!
      .selectAll("line.horizontal-grid")
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
        minHeight: `calc(0.5 * ${width}px)`,
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
            height={dimensions.height - margin.top - margin.bottom}
          />
        )}
      </Box>
    </Box>
  );
}
