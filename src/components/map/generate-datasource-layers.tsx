import { ScatterplotLayer } from "@deck.gl/layers";
import { DataSource, EarthQuake } from "@/components/datasource/types";
import {
  DataFilterExtension,
  DataFilterExtensionProps,
} from "@deck.gl/extensions";
import { Color } from "@deck.gl/core";
import { ColorMapping } from "../datasource/formatting/color-mapping";
import { GPU_filtering, SessionInterface } from "@/stores/project-store";

export function generateDataSourceLayers(
  layer_type: "1D" | "3D",
  dataSource: DataSource,
  data: EarthQuake[],
  sessionInterface: SessionInterface,
  filtering: GPU_filtering,
  positionOffset: number = 0
) {
  console.log(filtering)
  return new ScatterplotLayer<EarthQuake, DataFilterExtensionProps>({
    id: `mapLayer_${dataSource.internal_id}_${JSON.stringify(dataSource.formatting.color)}`, // absolutely stupid way of making it listening to a color state update and forcing a rerender
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
