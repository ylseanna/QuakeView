import { DataFilterExtension, DataFilterExtensionProps } from "@deck.gl/extensions";
import { LineLayer, ScatterplotLayer, ScatterplotLayerProps } from "@deck.gl/layers";
import { Color, LayerProps } from "@deck.gl/core";

import { ColorMapping } from "../datasource/formatting/color-mapping";
import { DataSource, EarthQuake } from "@/components/datasource/types";
import { GPU_filtering, SessionInterface } from "@/stores/project-store";

export function generateDataSourceMapLayers(
  layer_type: "1D" | "3D",
  dataSource: DataSource,
  data: EarthQuake[],
  sessionInterface: SessionInterface,
  filtering: GPU_filtering,
  positionOffset: number = 0,
) {
  console.log(filtering);

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
    getFillColor: (d: EarthQuake) =>
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
        sessionInterface.animation.tapered
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
  // filtering: GPU_filtering,
) {
  // console.log(filtering);

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
    new ScatterplotLayer<EarthQuake>({
      id: `DotLayer_${dataSource.internal_id}_${JSON.stringify(dataSource.formatting.color)}`, // absolutely stupid way of making it listen to a color state update and forcing a rerender
      data: data,
      getRadius: 0.1,
      radiusScale: dataSource.formatting.scale,
      getPosition: (d: EarthQuake) => [scaleX(d.t), scaleY(d.mag)],
      getFillColor: (d: EarthQuake) =>
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
    }),
  ];
}
