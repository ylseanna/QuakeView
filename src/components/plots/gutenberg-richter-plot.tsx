import { EarthQuake } from "../datasource/types";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Skeleton } from "@mui/material";
import { useDataStore } from "@/providers/data-store-provider";
import { useProjectStore } from "@/providers/project-store-provider";

export default function GutenbergRichterPlot() {
  const { dataSources } = useProjectStore((state) => state);

  const { data } = useDataStore((state) => state);

  const parentRef = useRef<HTMLInputElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const id = dataSources.allIDs[0];
  const dataSource = dataSources.byID[id];

  useLayoutEffect(() => {
    if (parentRef.current) {
      setDimensions({
        width: parentRef.current.offsetWidth,
        height: parentRef.current.offsetHeight,
      });
    }
  }, []);

  useEffect(() => {
    d3.select(id ? "#" + id : `#chart-${id}`)
      .select("svg")
      .remove();
    // set the dimensions and margins of the graph
    const margin = { top: 0, right: 0, bottom: 20, left: 20 },
      width = dimensions.width,
      height = dimensions.width * 0.5;

    // append the svg object to the body of the page
    const svg = d3
      .select(id ? "#" + id : `#chart-${id}`)
      .append("svg")
      .attr("width", width - margin.left + margin.right)
      .attr("height", height - margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    if (data[id]) {
      const bounds = dataSource.metadata.data_descr.find(
        (element) => element.variable == "mag"
      )!.bounds;

      const x = d3
        .scaleLinear()
        .domain([bounds[0], bounds[1]] as Iterable<d3.NumberValue>)
        .range([margin.left, width - margin.right]);

      const bins = d3.bin().thresholds(50).domain([bounds[0], bounds[1]])(
        (data[id].data as EarthQuake[]).map(
          (d) => d["mag"]
        ) as ArrayLike<number>
      );

      const ybounds = [
        d3.min(bins, (d) => (d.length > 1 ? Math.log10(d.length) : undefined)),
        d3.max(bins, (d) => Math.log10(d.length)),
      ];

      const y = d3.scaleLog(ybounds as Iterable<d3.NumberValue>, [
        height,
        margin.top,
      ]);

      svg
        .append("g")
        .selectAll()
        .data(bins)
        .join("rect")
        .attr("x", (d) => x(d.x0!))
        .attr("width", (d) => x(d.x1!) - x(d.x0!))
        .attr("y", (d) => y(Math.log10(d.length)))
        .attr(
          "height",
          (d) => y(ybounds[0] as number) - y(Math.log10(d.length))
        )
        .attr("fill", "var(--mui-palette-text-primary)")
        .attr("fill-opacity", 0.4);

      const xAxes = svg
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(
          d3.axisBottom(x)
          // .tickFormat(() => "")
        );

      const yAxes = svg
        .append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y).tickFormat((d) => `${d}`));

      yAxes.selectAll("line").attr("stroke-opacity", 0.6);
      xAxes.selectAll("line").attr("stroke-opacity", 0.6);

      svg
        .selectAll("line.horizontalGrid")
        .data(y.ticks())
        .enter()
        .append("line")
        .attr({
          class: "horizontalGrid",
          x1: margin.right,
          x2: width,
          y1: function (d: d3.NumberValue) {
            return y(d);
          },
          y2: function (d) {
            return y(d);
          },
          fill: "none",
          "shape-rendering": "crispEdges",
          stroke: "black",
          "stroke-width": "1px",
        });

      setIsLoading(false);
    }
  }, [id, dimensions, data, dataSource.metadata.data_descr]);

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={parentRef}
        id={id ? id : `chart-${id}`}
        style={{ position: "relative" }}
      >
        {isLoading && (
          <Skeleton
            sx={{ position: "absolute" }}
            variant="rectangular"
            width={dimensions.width}
            height={dimensions.width * 0.5}
          />
        )}
      </div>
    </div>
  );
}
