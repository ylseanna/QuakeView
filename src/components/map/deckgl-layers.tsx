"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useMemo, useState } from "react";
import { DeckProps, PickingInfo } from "@deck.gl/core";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { useControl } from "react-map-gl";
import { DataSource, EarthQuake } from "@/components/datasource/types";

import { generateDataSourceLayers } from "./generate-datasource-layers";
import MapToolTip from "./map-tooltip";
import { useProjectStore } from "@/providers/project-store-provider";

function DeckGLOverlay(props: DeckProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

interface DeckGLProps {
  dataSources: DataSource[] | null;
}

export default function DeckGLlayers({ dataSources }: DeckGLProps) {
  const sessionInterface = useProjectStore((state) => state.sessionInterface);
  const GPUfiltering = useProjectStore((state) => state.GPUfiltering);

  // TOOLTIP

  const [hoverInfo, setHoverInfo] = useState<PickingInfo<EarthQuake>>();

  // LAYERS
  const layers = useMemo(() => {
    const layers_to_set = generateDataSourceLayers(
      "1D",
      dataSources as DataSource[],
      sessionInterface,
      GPUfiltering
    );

    // Tooltip
    layers_to_set.forEach((layer) => {
      layer.onHover = (info: PickingInfo<EarthQuake>) => {
        setHoverInfo(info);
        return true;
      };
    });

    return layers_to_set;
  }, [GPUfiltering, dataSources, sessionInterface]);

  return (
    <>
      {" "}
      <DeckGLOverlay layers={layers} {...{ interleaved: true }} />
      {hoverInfo && (
        <MapToolTip pickingInfo={hoverInfo} dataSources={dataSources} />
      )}{" "}
    </>
  );
}
