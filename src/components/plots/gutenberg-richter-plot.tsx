import { Box, Skeleton } from "@mui/material";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as d3 from "d3";

import { useProjectStore } from "@/providers/project-store-provider";
import { useDataStore } from "@/providers/data-store-provider";
import { EarthQuake } from "../datasource/types";

export default function GutenbergRichterPlot() {
  const { dataSources } = useProjectStore((state) => state);

  const { data } = useDataStore((state) => state);

  const parentRef = useRef<HTMLInputElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [pointData, setPointData] = useState<PointData[]>([]);

  const margin = { top: 2, right: 2, bottom: 40, left: 26 },
    width = dimensions.width,
    height = dimensions.width * 0.5;

  interface PointData {
    id: string;
    color: string;
    mags: number[];
    xbounds: [number, number];
    ybounds: [number, number];
  }

  useLayoutEffect(() => {
    if (parentRef.current) {
      setDimensions({
        width: parentRef.current.offsetWidth,
        height: parentRef.current.offsetHeight,
      });
    }
  }, []);

  useEffect(() => {
    // loop over datasources and calculate bins and bounds

    const dataSourcesPointData = [];

    for (let i = 0; i < dataSources.allIDs.length; i++) {
      const dataSourceID = dataSources.allIDs[i];

      if (data[dataSourceID]) {
        const mags = (data[dataSourceID].data as EarthQuake[])
          .map((d) => d["mag"])
          .toSorted((a, b) => a - b)
          .reverse() as number[];

        console.log(mags);

        const xbounds = [d3.min(mags), d3.max(mags)];

        const ybounds = [1, mags.length]!;

        dataSourcesPointData.push({
          id: dataSourceID,
          mags: mags,
          xbounds: xbounds,
          ybounds: ybounds,
        } as PointData);
      }
    }

    setPointData(dataSourcesPointData);
  }, [data, dataSources.allIDs]);

  useEffect(() => {
    setIsLoading(true);

    d3.select("#chart-gutenberg-richter").select("svg").remove();
    // set the dimensions and margins of the graph

    // append the svg object to the body of the page
    const svg = d3
      .select("#chart-gutenberg-richter")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // find overall bounds

    const overallYbounds = [
      d3.min(pointData, (d) => d.ybounds[0]),
      d3.max(pointData, (d) => d.ybounds[1]),
    ];

    const overallXbounds = [
      d3.min(pointData, (d) => d.xbounds[0]),
      d3.max(pointData, (d) => d.xbounds[1]),
    ];

    const x = d3
      .scaleLinear()
      .domain([
        overallXbounds[0],
        overallXbounds[1],
      ] as Iterable<d3.NumberValue>)
      .range([margin.left, width - margin.right - margin.left])
      .nice();

    const y = d3
      .scaleLog()
      .domain([
        overallYbounds[0]!,
        overallYbounds[1]! * 1.1,
      ] as Iterable<d3.NumberValue>)
      .range([height - margin.bottom, margin.top]).nice();

    // x axes
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .style("font-size", ".9rem")
      .call(d3.axisBottom(x));

    // x axes label
    svg
      .append("text")
      .attr("x", (width - margin.left - margin.right) / 2)
      .attr("y", height - margin.top - 4)
      .attr("dx", margin.left)
      .attr("font-size", "1rem")
      .attr("text-anchor", "middle")
      .text("Magnitude");

    // y axes
    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .style("font-size", ".9rem")
      .call(d3.axisLeft(y).ticks(4).tickFormat((d) => `${Math.log10(d as number)}`));

    // y axes label
    svg
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
    svg
      .append("g")
      .attr("transform", `translate(0, ${margin.top})`)
      .call(d3.axisTop(x).tickSize(0).tickValues([]));

    // Add right stroke
    svg
      .append("g")
      .attr("transform", `translate(${width - margin.left - margin.right}, 0)`)
      .call(d3.axisRight(y).tickSize(0).tickValues([]));

    // Add vertical gridlines
    svg
      .selectAll("line.vertical-grid")
      .data(x.ticks())
      .enter()
      .append("line")
      .attr("class", "vertical-grid")
      .attr("x1", function (d) {
        return x(d);
      })
      .attr("y1", margin.top)
      .attr("x2", function (d) {
        return x(d);
      })
      .attr("y2", height - margin.bottom)
      .style("stroke", "gray")
      .style("stroke-width", 0.5)
      .style("stroke-dasharray", "2 2");

    // Add horizontal gridlines
    svg
      .selectAll("line.horizontal-grid")
      .data(y.ticks())
      .enter()
      .append("line")
      .attr("class", "horizontal-grid")
      .attr("x1", margin.left)
      .attr("y1", function (d) {
        return y(d);
      })
      .attr("x2", width - margin.right)
      .attr("y2", function (d) {
        return y(d);
      })
      .style("stroke", "gray")
      .style("stroke-width", 0.5)
      .style("stroke-dasharray", "2 2");

    // yAxes.selectAll("line").attr("stroke-opacity", 0.6);
    // xAxes.selectAll("line").attr("stroke-opacity", 0.6);

    for (let i = 0; i < pointData.length; i++) {
      const dataSourcePointData = pointData[i];

      const dataSource = dataSources.byID[dataSourcePointData.id];

      console.log(dataSourcePointData);

      svg
        .append("g")
        .selectAll("dot")
        .data(dataSourcePointData.mags)
        .enter()
        .append("circle")
        .attr("cx", (d) => x(d))
        .attr("cy", (d, i) => y(i + 1))
        .attr("r", 1.5)
        .style("fill", dataSource.formatting.color.single);

      setIsLoading(false);
    }
  }, [
    data,
    dataSources.allIDs,
    dataSources.byID,
    pointData,
    height,
    margin.bottom,
    margin.left,
    margin.right,
    margin.top,
    width,
  ]);

  return (
    <Box
      style={{
        position: "relative",
        display: "block",
        minHeight: `calc(0.5 * ${width}px)`,
      }}
    >
      <Box
        ref={parentRef}
        id="chart-gutenberg-richter"
        sx={{ position: "relative" }}
      >
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
