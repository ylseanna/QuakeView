// import { ReImg } from "reimg";
import linspace from "@stdlib/array-linspace";
import { createRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
// import { useTranslations } from "next-intl";
import * as d3 from "d3";

import { useCatalogData } from "@/components/data/use-data";
import { colormaps } from "../crameri-colormaps";
import { DataSource } from "../../custom/types";

interface LegendElementProps {
  dataSource: DataSource;
  layerType: "twoD" | "threeD" | "plot";
}

export default function ColormapLegend({
  dataSource,
  layerType,
}: LegendElementProps) {
  // extract color formatting for brevity
  const colorFormatting = useMemo(
    () => dataSource.formatting[layerType].color,
    [dataSource.formatting[layerType]],
  );

  // responsive dimensions
  const parentRef = useRef<HTMLInputElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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

  // get data
  const { data } = useCatalogData();

  // define scales
  const colorScale = createRef<d3.ScaleSequential<any, never>>();
  const axisScale = createRef<
    d3.ScaleTime<number, number, never> | d3.ScaleLinear<number, number, never>
  >();

  colorScale.current = d3
    .scaleSequential(
      d3.piecewise(
        d3.interpolateRgb,
        !colorFormatting.linear.inverted
          ? colormaps[colorFormatting.linear.cmap as keyof typeof colormaps]
          : colormaps[
              colorFormatting.linear.cmap as keyof typeof colormaps
            ].toReversed(),
      ),
    )
    .domain(colorFormatting.linear.domain[colorFormatting.linear.variable]!);

  // set the dimensions and margins of the graph
  const margin = { top: 0, right: 8, bottom: 30, left: 8 };

  useEffect(() => {
    const width = dimensions.width,
      height = 0;

    if (data.byID[dataSource.internal_id]) {
      axisScale.current =
        colorFormatting.linear.variable == "t"
          ? d3
              .scaleTime()
              .domain([
                new Date(
                  data.byID[dataSource.internal_id].bounds[
                    colorFormatting.linear.variable
                  ]![0] as number,
                ),
                new Date(
                  data.byID[dataSource.internal_id].bounds[
                    colorFormatting.linear.variable
                  ]![1] as number,
                ),
              ] as Iterable<d3.NumberValue>)
              .range([0, dimensions.width])
          : d3
              .scaleLinear()
              .domain(
                data.byID[dataSource.internal_id].bounds[
                  colorFormatting.linear.variable
                ]! as Iterable<d3.NumberValue>,
              )
              .range([0, dimensions.width]);

      d3.select(`#ColormapLegend-${dataSource.internal_id}`)
        .select("svg")
        .remove();

      const svg = d3
        .select(`#ColormapLegend-${dataSource.internal_id}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      if (data.byID[dataSource.internal_id]) {
        svg
          .append("g")
          .attr("transform", `translate(0, ${height + margin.top})`)
          .call(
            d3
              .axisBottom(axisScale.current)
              .tickValues(axisScale.current.ticks(4)),
          );

        svg
          .append("text")
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "text-bottom")
          .attr("font-size", 10)
          .attr("fill", "var(--mui-palette-text-primary)")
          .attr("x", width / 2)
          .attr("y", height + margin.top + margin.bottom - 2)
          .text(
            dataSource.metadata.variables.by_id[colorFormatting.linear.variable]
              .alias,
          );
      }
    }
  });

  const draw = useCallback(
    (context: CanvasRenderingContext2D) => {
      if (data.byID[dataSource.internal_id] && colorScale.current) {
        for (let i = 0; i < 512; ++i) {
          context.fillStyle = colorScale.current!(
            linspace(
              data.byID[dataSource.internal_id].bounds[
                colorFormatting.linear.variable
              ]![0],
              data.byID[dataSource.internal_id].bounds[
                colorFormatting.linear.variable
              ]![1],
              512,
            )[i],
          );
          context.fillRect(context.canvas.width / 512  * i, 0, 512 / context.canvas.width, context.canvas.height);
        }
      }
    },
    [colorScale, axisScale],
  );

  const Canvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    console.log(dimensions.width)

    useEffect(() => {
      const canvas = canvasRef.current!;

      canvas.style.width = dimensions.width + "px";
      canvas.style.height = "16px";
      canvas.style.marginTop = margin.top + "px";
      canvas.style.marginLeft = margin.left + "px";
      canvas.style.imageRendering = "pixelated";

      const context = canvas.getContext("2d");

      //Our draw come here
      draw(context!);

      // ReImg.fromCanvas(canvas).downloadPng(`preview${colorFormatting.linear.cmap}.png´`)
    }, [dataSource.formatting]);

    return <canvas ref={canvasRef} />;
  };

  return (
    <div ref={parentRef}>
      <div
        id={`ColormapLegend-${dataSource.internal_id}`}
        style={{
          marginLeft: "-8px",
          marginRight: "-8px",
          width: "calc(100% + 16px)",
        }}
      >
        <Canvas />
      </div>
    </div>
  );
}
