import { ScatterplotLayer } from "@deck.gl/layers";
import { DataSource } from "@/components/datasource/types";
import {
  DataFilterExtension,
  DataFilterExtensionProps,
} from "@deck.gl/extensions";
import { Color } from "@deck.gl/core";
import { dataSourceDataUrl } from "../datasource/data-source-query";
import { ColorMapping } from "../datasource/formatting/color-mapping";
import { GPU_filtering, SessionInterface } from "@/stores/project-store";

type EarthQuake = {
  id: string;
  mag: number;
  dep: number;
  lon: number;
  lat: number;
  [key: string]: number | string;
};

export function generateDataSourceLayers(
  layer_type: "1D" | "3D",
  dataSources: DataSource[],
  sessionInterface: SessionInterface,
  filtering: GPU_filtering,
  positionOffset: number = 0
) {
  let layers_to_set: ScatterplotLayer<EarthQuake>[] = [];

  if (dataSources != null) {
    dataSources.forEach((dataSource) => {
      const layer = new ScatterplotLayer<EarthQuake, DataFilterExtensionProps>({
        id: `mapLayer_${dataSource.internal_id}_${JSON.stringify(dataSource.formatting.color)}`, // absolutely stupid way of making it listening to a color state update and forcing a rerender
        data: dataSourceDataUrl(dataSource),
        // stroked: true,
        visible: dataSource.interface.visible,
        getPosition:
          layer_type === "3D"
            ? (d: EarthQuake) => [
                d.lon,
                d.lat,
                (d.dep + positionOffset) * -1000,
              ]
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
          filtering.mag,
          [
            sessionInterface.animation.tapered
              ? filtering.t[1]
              : filtering.t[0],
            filtering.t[1],
          ],
        ],
        filterTransformSize: true,
        filterTransformColor: false,
        filterRange: [filtering.mag, filtering.t],
        extensions: [new DataFilterExtension({ filterSize: 2 })],
      });

      layers_to_set = [...layers_to_set, layer];
    });
  }

  return layers_to_set;
}
