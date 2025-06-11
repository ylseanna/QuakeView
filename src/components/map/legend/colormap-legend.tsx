import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  DataSource,
  DataSourceDataDescription,
} from "../../datasource/types";
// import { useTranslations } from "next-intl";
import * as d3 from "d3";
import { colormaps } from "../crameri-colormaps";
// import { ReImg } from "reimg";

interface LegendElementProps {
  dataSource: DataSource;
}

export default function ColormapLegend({ dataSource }: LegendElementProps) {
  const parentRef = useRef<HTMLInputElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (parentRef.current) {
      setDimensions({
        width: parentRef.current.offsetWidth,
        height: parentRef.current.offsetHeight,
      });
    }
  }, []);

  const n = 512;
  const colorFormatting = dataSource.formatting.color;

  const colorScale = d3
    .scaleSequential(
      d3.piecewise(
        d3.interpolateRgb,
        colorFormatting.linear.inverted
          ? colormaps[colorFormatting.linear.cmap].toReversed()
          : colormaps[colorFormatting.linear.cmap]
      )
    )
    .domain([0, 0.5]);

  const draw = useCallback(
    (context: CanvasRenderingContext2D) => {
      for (let i = 0; i < n; ++i) {
        context.fillStyle = colorScale(i / (n - 1));
        context.fillRect(i, 0, 1, context.canvas.height);
      }
    },
    [colorScale]
  );

  // set the dimensions and margins of the graph
  const margin = { top: 0, right: 8, bottom: 30, left: 8 },
    width = dimensions.width,
    height = 0;

  useEffect(() => {
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

    const x = d3
      .scaleLinear()
      .domain([
        Math.min(
          ...colorFormatting.linear.domain[colorFormatting.linear.variable]
        ),
        Math.max(
          ...colorFormatting.linear.domain[colorFormatting.linear.variable]
        ),
      ])
      .range([0, width - 1]);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height + margin.top})`)
      .call(d3.axisBottom(x).tickValues(x.ticks(5)));

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "text-bottom")
      .attr("font-size", 10)
      .attr("fill", "var(--mui-palette-text-primary)")
      .attr("x", width / 2)
      .attr("y", height + margin.top + margin.bottom - 2)
      .text(
        dataSource.metadata.data_descr.find(
          (dataDescription: DataSourceDataDescription) =>
            dataDescription.variable == colorFormatting.linear.variable
        )!.alias
      );
  });

  const Canvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

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
    }, []);

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
