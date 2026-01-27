import { DataSource, EarthQuake } from "../datasource/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import * as d3 from "d3";

import { Box, Skeleton, Slider, Typography } from "@mui/material";

type D3Earthquake = EarthQuake & { date: Date };

export default function TimelineSlider({
  dataSources,
  setDataSources,
}: {
  dataSources: DataSource[];
  setDataSources: Dispatch<SetStateAction<DataSource[] | null>>;
}) {
  const setFiltering = (
    id: string,
    variableToModify: string,
    value: [number, number] | null
  ) => {
    const indexToModify = dataSources?.findIndex(
      (dataSource) => dataSource.internal_id === id
    );

    const modifiedDataSource = dataSources[indexToModify];

    if (value) {
      modifiedDataSource.filtering = {
        ...modifiedDataSource.filtering,
        [variableToModify]: value,
      };
    } else {
      delete modifiedDataSource.filtering[variableToModify];
    }

    dataSources[indexToModify] = modifiedDataSource;

    setDataSources(dataSources);
  };

  const parentRef = useRef<HTMLInputElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);

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

  console.log(dimensions);

  const margin = { top: 8, right: 8, bottom: 24, left: 20 },
    width = dimensions.width,
    height = dimensions.height;

  // global data bounds

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

  useEffect(() => {
    const dataSource = dataSources[0];

    d3.select("#timeline-graph").select("svg").remove();

    const container = d3
      .select("#timeline-graph")

    // append the svg object to the body of the page
    const svg = container
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3
      .scaleTime()
      .domain([new Date(t_min), new Date(t_max)])
      .range([margin.left, width - margin.right - margin.left]);

    const xAxes = svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
      .call(
        d3.axisBottom(x)
        // .tickFormat(() => "")
      );

    xAxes.selectAll("line").attr("stroke-opacity", 0.6);

    const y = d3
      .scaleLinear()
      .domain([m_min, m_max] as Iterable<d3.NumberValue>)
      .range([height - margin.top - margin.bottom, margin.top]);

    const yAxes = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(
        d3.axisLeft(y)
        // .tickFormat(() => "")
      );
    yAxes.selectAll("line").attr("stroke-opacity", 0.6);

    d3.json(
      `http://${process.env.NEXT_PUBLIC_HOST}${process.env.NEXT_PUBLIC_APP_BASE_PATH}/api/plot_data?mode=timeline_plot&filename=${dataSource.filename}`
    )
      .then((data) => {
        if (!data) {
          console.log("no data");
        } else {
          (data as D3Earthquake[]).forEach((d: D3Earthquake) => {
            const t = Math.round(d["t"] as number);
            d.date = new Date(t);
          });

          const y = d3
            .scaleLinear()
            .domain([
              d3.min(data as D3Earthquake[], (d: D3Earthquake) => d.mag),
              d3.max(data as D3Earthquake[], (d: D3Earthquake) => d.mag),
            ] as Iterable<d3.NumberValue>)
            .range([height - margin.top - margin.bottom, margin.top]);

          yAxes.call(d3.axisLeft(y));

          svg
            .append("g")
            .attr("stroke", "#000")
            .attr("stroke-opacity", 0.2)
            .selectAll()
            .data(data as D3Earthquake[])
            .join("circle")
            .attr("cx", (d: D3Earthquake) => x(d["t"] as number))
            .attr("cy", (d: D3Earthquake) => y(d["mag"] as number))
            .attr("r", 0.5);
        }
      })
      .then(() => {
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dimensions,
    height,
    width,
    margin.top,
    margin.bottom,
    margin.left,
    margin.right,
    m_max,
    m_min,
    t_max,
    t_min,
  ]);

  const [localDomain, setLocalDomain] = useState<[number, number]>([
    t_min,
    t_max,
  ]);

  return (
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
        style={{
          position: "relative",
          height: "100%",
          width: "100%",
          margin: "-8px",
        }}
      >
        {isLoading && (
          <Skeleton
            sx={{
              position: "absolute",
              top: 2 * margin.top + "px",
              left: 2 * margin.left + "px",
            }}
            variant="rectangular"
            width={dimensions.width - (8 + 2 * margin.left)}
            height={dimensions.height - (8 + margin.top + margin.bottom)}
          />
        )}
      </Box>
      <Slider
        value={localDomain}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => (
          <Typography fontSize={12}>{Math.round(value)}</Typography>
        )}
        min={t_min}
        max={t_max}
        // step={step}
        // marks={marks}
        onChange={(event: Event, newValue: number | number[]) => {
          setLocalDomain(newValue as [number, number]);
          setFiltering(
            dataSources[0].internal_id,
            "t",
            newValue as [number, number]
          );
        }}
        size="small"
        // onChangeCommitted={onChangeCommitted}
        sx={{
          position: "absolute",
          left: 12 + margin.left + "px",
          bottom: 10 + "px",
          width: dimensions.width - (8 + 2 * margin.left),
        }}
      />
    </div>
  );
}
