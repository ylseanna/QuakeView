"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useMemo, useState } from "react";
import { DeckProps, PickingInfo } from "@deck.gl/core";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { useControl } from "react-map-gl";
import { EarthQuake } from "@/components/datasource/types";

import { generateDataSourceLayers } from "./generate-datasource-layers";
import MapToolTip from "./map-tooltip";
import { useProjectStore } from "@/providers/project-store-provider";
import { useDataStore } from "@/providers/data-store-provider";

function DeckGLOverlay(props: DeckProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

export default function DeckGLlayers() {
  const sessionInterface = useProjectStore((state) => state.sessionInterface);
  const GPUfiltering = useProjectStore((state) => state.GPUfiltering);

  const dataSources = useProjectStore((state) => state.dataSources);
  const { data } = useDataStore((state) => state);

  // TOOLTIP

  const [hoverInfo, setHoverInfo] = useState<PickingInfo<EarthQuake>>();

  // LAYERS
  const layers = useMemo(() => {
    const layers_to_set = dataSources.allIDs.map((id) => {
      if (data[id]) {
        const layer = generateDataSourceLayers(
          "1D",
          dataSources.byID[id],
          data[id].data,
          sessionInterface,
          GPUfiltering,
        );

        layer.onHover = (info: PickingInfo<EarthQuake>) => {
          setHoverInfo(info);
          return true;
        };

        return layer
      }
    });

    console.log(layers_to_set);

    return layers_to_set

  }, [
    dataSources.allIDs,
    dataSources.byID,
    data,
    sessionInterface,
    GPUfiltering,
  ]);

  return (
    <>
      {" "}
      <DeckGLOverlay layers={layers} {...{ interleaved: true }} />
      {hoverInfo && (
        <MapToolTip pickingInfo={hoverInfo}/>
      )}{" "}
    </>
  );
}
