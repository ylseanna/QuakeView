import * as d3 from "d3";

import { DataSourceColorFormatting, EarthQuake } from "../types";
import { colormaps, colormaps_categorical } from "../../map/crameri-colormaps";
import { Color } from "@deck.gl/core";



export const ColorMapping = (
    d: EarthQuake,
    colorFormatting: DataSourceColorFormatting
  ) => {
    if (colorFormatting.mapping == "single") {
      const color = d3.color(colorFormatting.single) as d3.RGBColor;
      return [color.r, color.g, color.b] as Color;
    } else if (colorFormatting.mapping == "linear") {
      const colorScale = d3
        .scaleSequential(
          d3.piecewise(
            d3.interpolateRgb,
            !colorFormatting.linear.inverted
              ? colormaps[colorFormatting.linear.cmap as keyof typeof colormaps]
              : colormaps[
                  colorFormatting.linear.cmap as keyof typeof colormaps
                ].toReversed()
          )
        )
        .domain(colorFormatting.linear.domain[colorFormatting.linear.variable]);
      const color = d3.color(
        colorScale(d[colorFormatting.linear.variable] as d3.NumberValue)
      ) as d3.RGBColor;
      return [color.r, color.g, color.b] as Color;
    } else if (colorFormatting.mapping == "categorical") {
      const length =
        colormaps_categorical[colorFormatting.categorical.cmap].length;

      const colorScale = d3
        .scaleOrdinal()
        .range(
          !colorFormatting.categorical.inverted
            ? colormaps_categorical[colorFormatting.categorical.cmap]
            : colormaps_categorical[
                colorFormatting.categorical.cmap
              ].toReversed()
        )
        .domain(d3.range(length).map((i) => String(i)));
      if (Number.isInteger(d[colorFormatting.categorical.variable])) {
        const value = Number(d[colorFormatting.categorical.variable]) % length;

        const color = d3.color(
          colorScale(String(value)) as string
        ) as d3.RGBColor;

        return [color.r, color.g, color.b] as Color;
      } else {
        // .scaleSequential(colormaps_categorical[colorFormatting.categorical.cmap])
        const color = d3.color(colorScale("1") as string) as d3.RGBColor;
        return [color.r, color.g, color.b] as Color;
      }
    }
  };