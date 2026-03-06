"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useMemo, useState } from "react";
import { DeckProps, PickingInfo } from "@deck.gl/core";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { useControl } from "react-map-gl/maplibre";
import { Earthquake } from "@/components/custom/types";

import { generateDataSourceMapLayers } from "./generate-datasource-layers";
import MapToolTip from "./map-tooltip";
import { useProjectStore } from "@/providers/project-store-provider";
import{ useCatalogData } from "../data/use-data";
import { ScatterplotLayer } from "deck.gl";
import { DataFilterExtensionProps } from "@deck.gl/extensions";

function DeckGLOverlay(props: DeckProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

export default function DeckGLlayers() {
  const sessionInterface = useProjectStore((state) => state.sessionInterface);
  const GPUfiltering = useProjectStore((state) => state.GPUfiltering);

  const dataSources = useProjectStore((state) => state.dataSources);
  const { data } = useCatalogData();

  // TOOLTIP

  const [hoverInfo, setHoverInfo] = useState<PickingInfo<Earthquake>>();

  // LAYERS
  const layers = useMemo(() => {
    let layers_to_set = [] as ScatterplotLayer<Earthquake, DataFilterExtensionProps>[];

    if (data) {
      layers_to_set = data.allIDs.map((id: string) => {
        const layer = generateDataSourceMapLayers(
          "twoD",
          dataSources.byID[id],
          data.byID[id].data,
          sessionInterface,
          GPUfiltering,
        );

        layer.onHover = (info: PickingInfo<Earthquake>) => {
          setHoverInfo(info);
          return true;
        };

        return layer;
      });
    }


    return layers_to_set;
  }, [
    // dataSources.allIDs,
    dataSources.byID,
    data,
    sessionInterface,
    GPUfiltering,
  ]);

  return (
    <>
      <DeckGLOverlay useDevicePixels={false} layers={layers} {...{ interleaved: true }} />
      {hoverInfo && <MapToolTip pickingInfo={hoverInfo} />}
    </>
  );
}
