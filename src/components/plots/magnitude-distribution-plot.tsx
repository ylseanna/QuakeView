import { Skeleton } from "@mui/material";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as d3 from "d3";

import { useProjectStore } from "@/providers/project-store-provider";
import { useData } from "../datasource/use-data";
import { Earthquake } from "../datasource/types";

export default function MagnitudeDistributionPlot() {
  const { dataSources } = useProjectStore((state) => state);

  const { data } = useData();

  const parentRef = useRef<HTMLInputElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [dataSourcesBins, setDataSourcesBins] = useState<DataSourceBins[]>([]);

  const margin = { top: 2, right: 2, bottom: 40, left: 32 },
    width = dimensions.width,
    height = dimensions.width * 0.3;

  interface DataSourceBins {
    id: string;
    color: string;
    bins: d3.Bin<number, number>[];
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

    const dataSourcesBins= [] as DataSourceBins[];

    data.allIDs.map((id) => {

        const dataSource = dataSources.byID[id];

        const xbounds = data.byID[id].bounds["mag"]!;

        const bins = d3.bin().thresholds(50).domain([xbounds[0], xbounds[1]])(
          (data.byID[id].data as Earthquake[]).map(
            (d) => d["mag"],
          ) as ArrayLike<number>,
        );

        const ybounds = [
          d3.min(bins, (d) => d.length)!,
          d3.max(bins, (d) => d.length)!,
        ] as [number, number];

        dataSourcesBins.push({
          id: id,
          color: dataSource.formatting.plot.color.single as unknown as string,
          bins: bins,
          xbounds: xbounds,
          ybounds: ybounds,
        });
    })

    setDataSourcesBins(dataSourcesBins as DataSourceBins[]);
  }, [dimensions, data, dataSources, width, margin.left, margin.right, margin.top, margin.bottom, height, data.allIDs]);

  useEffect(() => {
    setIsLoading(true);

    d3.select("#chart-magnitude-distribution").select("svg").remove();
    // set the dimensions and margins of the graph

    // append the svg object to the body of the page
    const svg = d3
      .select("#chart-magnitude-distribution")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // find overall bounds

    const overallYbounds = [
      d3.min(dataSourcesBins, (d) => d.ybounds[0]),
      d3.max(dataSourcesBins, (d) => d.ybounds[1]),
    ];

    const overallXbounds = [
      d3.min(dataSourcesBins, (d) => d.xbounds[0]),
      d3.max(dataSourcesBins, (d) => d.xbounds[1]),
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
      .scaleLinear()
      .domain([
        overallYbounds[0],
        overallYbounds[1]! * 1.1,
      ] as Iterable<d3.NumberValue>)
      .range([height - margin.bottom, margin.top]);

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
      .attr("y", height - 4 - margin.top)
      .attr("dx", margin.left)
      .attr("font-size", "1rem")
      .attr("text-anchor", "middle")
      .text("Magnitude");

    // y axes
    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .style("font-size", ".9rem")
      .call(d3.axisLeft(y).ticks(4).tickFormat((d) => `${d}`));

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
      .text("\u004E");

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

    // // Add horizontal gridlines
    // svg
    //   .selectAll("line.horizontal-grid")
    //   .data(y.ticks())
    //   .enter()
    //   .append("line")
    //   .attr("class", "horizontal-grid")
    //   .attr("x1", 0)
    //   .attr("y1", function (d) {
    //     return y(d);
    //   })
    //   .attr("x2", width)
    //   .attr("y2", function (d) {
    //     return y(d);
    //   })
    //   .style("stroke", "gray")
    //   .style("stroke-width", 0.5)
    //   .style("stroke-dasharray", "2 2");

    // yAxes.selectAll("line").attr("stroke-opacity", 0.6);
    // xAxes.selectAll("line").attr("stroke-opacity", 0.6);

    for (let i = 0; i < dataSourcesBins.length; i++) {
      const singleDataSourceBins = dataSourcesBins[i];

      svg
        .append("g")
        .selectAll()
        .data(singleDataSourceBins.bins)
        .join("rect")
        .attr("x", (d) => x(d.x0!))
        .attr("width", (d) => x(d.x1!) - x(d.x0!))
        .attr("y", (d) => y(d.length))
        .attr(
          "height",
          (d) => y(overallYbounds[0] as number) - y(d.length),
        )
        .attr("fill", singleDataSourceBins.color)
        .attr("fill-opacity", 0.4);

      setIsLoading(false);
    }
  }, [
    dataSourcesBins,
    height,
    margin.bottom,
    margin.left,
    margin.right,
    margin.top,
    width,
  ]);

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={parentRef}
        id="chart-magnitude-distribution"
        style={{ position: "relative" }}
      >
        {isLoading && (
          <Skeleton
            sx={{ position: "absolute" }}
            variant="rectangular"
            width={dimensions.width}
            height={dimensions.width * 0.3}
          />
        )}
      </div>
    </div>
  );
}
