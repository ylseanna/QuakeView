import { DataSource, EarthQuake } from "../datasource/types";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Skeleton, Slider, SliderOwnProps } from "@mui/material";
import { useDataStore } from "@/providers/data-store-provider";

export default function HistogramSlider({
  id,
  dataSource,
  variable,
  value,
  min,
  max,
  marks,
  onChange,
  onChangeCommitted,
}: {
  id?: string;
  dataSource: DataSource;
  variable: string;
  value: SliderOwnProps["value"];
  min: SliderOwnProps["max"];
  max: SliderOwnProps["max"];
  marks?: SliderOwnProps["marks"];
  onChange: SliderOwnProps["onChange"];
  onChangeCommitted: SliderOwnProps["onChangeCommitted"];
}) {
  const { data } = useDataStore((state) => state);

  const parentRef = useRef<HTMLInputElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const step = Number((max! - min!).toPrecision(1)) / 100;

  useLayoutEffect(() => {
    if (parentRef.current) {
      setDimensions({
        width: parentRef.current.offsetWidth,
        height: parentRef.current.offsetHeight,
      });
    }
  }, []);

  useEffect(() => {
    d3.select(id ? "#" + id : `#chart-${dataSource.internal_id}`)
      .select("svg")
      .remove();
    // set the dimensions and margins of the graph
    const margin = { top: 0, right: 0, bottom: 20, left: 0 },
      width = dimensions.width,
      height = dimensions.width * 0.3;

    // append the svg object to the body of the page
    const svg = d3
      .select(id ? "#" + id : `#chart-${dataSource.internal_id}`)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3
      .scaleLinear()
      .domain([min, max] as Iterable<d3.NumberValue>)
      .range([margin.left, width - margin.right]);

    // d3.json(dataSourceDataUrl(dataSource)).then((data) => {
    //   if (!data) {
    //     console.log("no data");
    //   } else {
    if (data[dataSource.internal_id]) {
      const bins = d3.bin().thresholds(50).domain([min!, max!])(
        (data[dataSource.internal_id].data as EarthQuake[]).map(
          (d) => d[variable]
        ) as ArrayLike<number>
      );

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(bins, (d) => d.length)] as Iterable<d3.NumberValue>)
        .range([height, margin.top]);

      svg
        .append("g")
        .selectAll()
        .data(bins)
        .join("rect")
        .attr("x", (d) => x(d.x0!))
        .attr("width", (d) => x(d.x1!) - x(d.x0!))
        .attr("y", (d) => y(d.length))
        .attr("height", (d) => y(0) - y(d.length))
        .attr("fill", "var(--mui-palette-text-primary)")
        .attr("fill-opacity", 0.4);

      const xAxes = svg
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(
          d3.axisBottom(x)
          // .tickFormat(() => "")
        );

      xAxes.selectAll("line").attr("stroke-opacity", 0.6);
      xAxes.selectAll("path").remove();
      // }
      setIsLoading(false);
    }
    //   // X axis
    // });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dataSource.internal_id,
    id,
    dataSource.filename,
    min,
    max,
    step,
    dimensions,
    data,
  ]);

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={parentRef}
        id={id ? id : `chart-${dataSource.internal_id}`}
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
      <Slider
        value={value}
        valueLabelDisplay="auto"
        min={min}
        max={max}
        step={step}
        marks={marks}
        onChange={onChange}
        size="small"
        onChangeCommitted={onChangeCommitted}
        sx={{ position: "absolute", bottom: 7, width: dimensions.width }}
      />
    </div>
  );
}
