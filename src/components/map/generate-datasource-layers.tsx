import {
  DataFilterExtension,
  DataFilterExtensionProps,
} from "@deck.gl/extensions";
import { LineLayer, ScatterplotLayer } from "@deck.gl/layers";
import { Color } from "@deck.gl/core";
import * as d3 from "d3";

import {
  DataSource,
  DataSourceColorFormatting,
  EarthQuake,
} from "@/components/datasource/types";
import { GPU_filtering, SessionInterface } from "@/stores/project-store";
import { colormaps, colormaps_categorical } from "./crameri-colormaps";

const d3Color_to_deckGLColor = (color: d3.RGBColor) =>
  [color.r, color.g, color.b] as Color;

export function generateDataSourceMapLayers(
  layer_type: "1D" | "3D",
  dataSource: DataSource,
  data: EarthQuake[],
  sessionInterface: SessionInterface,
  filtering: GPU_filtering,
  positionOffset: number = 0,
) {
  const linearColorScale = d3
    .scaleSequential(
      d3.piecewise(
        d3.interpolateRgb,
        !dataSource.formatting.color.linear.inverted
          ? colormaps[
              dataSource.formatting.color.linear.cmap as keyof typeof colormaps
            ]
          : colormaps[
              dataSource.formatting.color.linear.cmap as keyof typeof colormaps
            ].toReversed(),
      ),
    )
    .domain(
      dataSource.formatting.color.linear.domain[
        dataSource.formatting.color.linear.variable
      ]!,
    );

  const categoricalColorScale = d3
    .scaleOrdinal()
    .range(
      !dataSource.formatting.color.categorical.inverted
        ? colormaps_categorical[dataSource.formatting.color.categorical.cmap]
        : colormaps_categorical[
            dataSource.formatting.color.categorical.cmap
          ].toReversed(),
    )
    .domain(
      d3
        .range(
          colormaps_categorical[dataSource.formatting.color.categorical.cmap]
            .length,
        )
        .map((i) => String(i)),
    );

  const ColorMapping = (
    d: EarthQuake,
    colorFormatting: DataSourceColorFormatting,
  ) => {
    if (colorFormatting.mapping == "linear") {
      return d3Color_to_deckGLColor(
        d3.color(
          linearColorScale(
            d[colorFormatting.linear.variable] as d3.NumberValue,
          ),
        ) as d3.RGBColor,
      );
    } else if (colorFormatting.mapping == "categorical") {
      const length =
        colormaps_categorical[colorFormatting.categorical.cmap].length;

      if (Number.isInteger(d[colorFormatting.categorical.variable])) {
        const value = Number(d[colorFormatting.categorical.variable]) % length;

        return d3Color_to_deckGLColor(
          d3.color(
            categoricalColorScale(String(value)) as string,
          ) as d3.RGBColor,
        );
      } else {
        // .scaleSequential(colormaps_categorical[colorFormatting.categorical.cmap])
        return d3Color_to_deckGLColor(
          d3.color(categoricalColorScale("1") as string) as d3.RGBColor,
        );
      }
    }
  };

  return new ScatterplotLayer<EarthQuake, DataFilterExtensionProps>({
    id: `mapLayer_${dataSource.internal_id}_${JSON.stringify(dataSource.formatting.color)}`, // absolutely stupid way of making it listen to a color state update and forcing a rerender
    data: data,
    // stroked: true,
    visible: dataSource.interface.visible,
    getPosition:
      layer_type === "3D"
        ? (d: EarthQuake) => [d.lon, d.lat, (d.dep + positionOffset) * -1000]
        : layer_type === "1D"
          ? (d: EarthQuake) => [d.lon, d.lat]
          : undefined,
    getRadius: 1,
    radiusScale: dataSource.formatting.scale,
    getFillColor:
      dataSource.formatting.color.mapping == "single"
        ? d3Color_to_deckGLColor(
            d3.color(
              dataSource.formatting.color.single as unknown as string,
            ) as d3.RGBColor,
          )
        : (d: EarthQuake) =>
            ColorMapping(d, dataSource.formatting.color) as Color,
    autoHighlight: true,
    highlightColor: [255, 255, 255, 140],
    colorFormat: "RGB",
    opacity: dataSource.formatting.opacity / 100,
    stroked: false,
    getLineColor: [255, 255, 255, 0.5 * 255],
    lineWidthUnits: "pixels",
    billboard: true,
    antialiasing: dataSource.formatting.antialiasing,
    pickable: sessionInterface.pickable,
    updateTriggers: {
      getPosition: [positionOffset],
    },
    transitions: {
      getPosition: { type: "spring", stiffness: 0.01, damping: 0.2 },
    },
    getFilterValue: (d) => [d.mag, d.t],
    filterSoftRange: [
      filtering.mag as [number, number],
      [
        sessionInterface.animation.timeline.tapered
          ? (filtering.t[1] as number)
          : (filtering.t[0] as number),
        filtering.t[1] as number,
      ],
    ],
    filterTransformSize: true,
    filterTransformColor: false,
    filterRange: [
      filtering.mag as [number, number],
      filtering.t as [number, number],
    ],
    extensions: [new DataFilterExtension({ filterSize: 2, fp64: true })],
  });
}

export function StemPlotLayers(
  // layer_type: "1D" | "3D",
  dataSource: DataSource,
  data: EarthQuake[],
  sessionInterface: SessionInterface,
  scaleX: d3.ScaleTime<number, number, never>,
  scaleY: d3.ScaleLinear<number, number, never>,
  baseLineY: number,
  include_stem: boolean = true,
  // filtering: GPU_filtering,
) {
  // console.log(filtering);

  const linearColorScale = d3
    .scaleSequential(
      d3.piecewise(
        d3.interpolateRgb,
        !dataSource.formatting.color.linear.inverted
          ? colormaps[
              dataSource.formatting.color.linear.cmap as keyof typeof colormaps
            ]
          : colormaps[
              dataSource.formatting.color.linear.cmap as keyof typeof colormaps
            ].toReversed(),
      ),
    )
    .domain(
      dataSource.formatting.color.linear.domain[
        dataSource.formatting.color.linear.variable
      ]!,
    );

  const categoricalColorScale = d3
    .scaleOrdinal()
    .range(
      !dataSource.formatting.color.categorical.inverted
        ? colormaps_categorical[dataSource.formatting.color.categorical.cmap]
        : colormaps_categorical[
            dataSource.formatting.color.categorical.cmap
          ].toReversed(),
    )
    .domain(
      d3
        .range(
          colormaps_categorical[dataSource.formatting.color.categorical.cmap]
            .length,
        )
        .map((i) => String(i)),
    );

  const ColorMapping = (
    d: EarthQuake,
    colorFormatting: DataSourceColorFormatting,
  ) => {
    if (colorFormatting.mapping == "linear") {
      return d3Color_to_deckGLColor(
        d3.color(
          linearColorScale(
            d[colorFormatting.linear.variable] as d3.NumberValue,
          ),
        ) as d3.RGBColor,
      );
    } else if (colorFormatting.mapping == "categorical") {
      const length =
        colormaps_categorical[colorFormatting.categorical.cmap].length;

      if (Number.isInteger(d[colorFormatting.categorical.variable])) {
        const value = Number(d[colorFormatting.categorical.variable]) % length;

        return d3Color_to_deckGLColor(
          d3.color(
            categoricalColorScale(String(value)) as string,
          ) as d3.RGBColor,
        );
      } else {
        // .scaleSequential(colormaps_categorical[colorFormatting.categorical.cmap])
        return d3Color_to_deckGLColor(
          d3.color(categoricalColorScale("1") as string) as d3.RGBColor,
        );
      }
    }
  };

  const scatterplotLayer = new ScatterplotLayer<EarthQuake>({
    id: `DotLayer_${dataSource.internal_id}_${JSON.stringify(dataSource.formatting.color)}`, // absolutely stupid way of making it listen to a color state update and forcing a rerender
    data: data,
    getRadius: 0.1,
    radiusScale: dataSource.formatting.scale,
    getPosition: (d: EarthQuake) => [scaleX(d.t), scaleY(d.mag)],
    getFillColor:
      dataSource.formatting.color.mapping == "single"
        ? d3Color_to_deckGLColor(
            d3.color(
              dataSource.formatting.color.single as unknown as string,
            ) as d3.RGBColor,
          )
        : (d: EarthQuake) =>
            ColorMapping(d, dataSource.formatting.color) as Color,
    autoHighlight: true,
    highlightColor: [255, 255, 255, 140],
    colorFormat: "RGB",
    opacity: dataSource.formatting.opacity / 100,
    stroked: false,
    getLineColor: [255, 255, 255, 0.5 * 255],
    lineWidthUnits: "pixels",
    billboard: true,
    antialiasing: dataSource.formatting.antialiasing,
    pickable: sessionInterface.pickable,
    fp64: true,
    transitions: {
      getPosition: { type: "spring", stiffness: 0.01, damping: 0.2 },
    },
  });

  if (include_stem) {
    return [
      new LineLayer<EarthQuake>({
        id: `StemLayer_${dataSource.internal_id}_${JSON.stringify(dataSource.formatting.color)}`, // absolutely stupid way of making it listen to a color state update and forcing a rerender
        data: data,
        getWidth: 0.05,
        widthScale: dataSource.formatting.scale,
        getSourcePosition: (d: EarthQuake) => [scaleX(d.t), scaleY(d.mag)],
        getTargetPosition: (d: EarthQuake) => [scaleX(d.t), baseLineY],
        // getColor: (d: EarthQuake) =>
        //   ColorMapping(d, dataSource.formatting.color) as Color,
        getColor: [0, 0, 0],
        autoHighlight: true,
        highlightColor: [255, 255, 255, 140],
        colorFormat: "RGB",
        opacity: 0.1,
        pickable: false,
        transitions: {
          getPosition: { type: "spring", stiffness: 0.01, damping: 0.2 },
        },
      }),
      scatterplotLayer,
    ];
  } else {
    return scatterplotLayer;
  }
}
