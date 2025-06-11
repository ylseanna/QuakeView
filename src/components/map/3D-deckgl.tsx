"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useMemo, useRef, useState } from "react";
import { DataSource, EarthQuake, Extent } from "@/components/datasource/types";

import DeckGL, { FullscreenWidget, ZoomWidget } from "@deck.gl/react";
import "@deck.gl/widgets/stylesheet.css";
import {
  FlyToInterpolator,
  MapView,
  MapViewState,
  PickingInfo,
} from "@deck.gl/core";
import { Button, LinearProgress } from "@mui/material";
import { generateDataSourceLayers } from "./generate-datasource-layers";
import MapToolTip from "./map-tooltip";
import { useProjectStore } from "@/providers/project-store-provider";
// import { TerrainLayer } from "@deck.gl/geo-layers";
// import { GeoJsonLayer } from "@deck.gl/layers";

interface DeckGLProps {
  dataSources: DataSource[] | null;
  extent: Extent | null;
  positionOffset: number;
}

export default function ThreeDDeckGLView({
  dataSources,
  extent,
  positionOffset,
}: DeckGLProps) {
  const INITIAL_VIEWSTATE = useMemo(
    () => ({
      longitude: extent ? extent.centroid[0] : -19,
      latitude: extent ? extent.centroid[1] : 64,
      zoom: 12,
      pitch: 0,
      bearing: 0,
      minZoom: 1,
      maxZoom: 20,
      maxPitch: 180,
      position: [0, 0, 0],
    }),
    [extent]
  );

  const mapContainer = useRef<HTMLElement>(null);

  const sessionInterface = useProjectStore((state) => state.sessionInterface);
  const GPUfiltering = useProjectStore((state) => state.GPUfiltering);

  useEffect(() => {
    mapContainer.current = document.getElementsByTagName("main")[0];
  }, [mapContainer]);

  // TOOLTIP

  const [hoverInfo, setHoverInfo] = useState<PickingInfo<EarthQuake>>();

  // LAYERS
  const layers = useMemo(() => {
    const layers_to_set = generateDataSourceLayers(
      "3D",
      dataSources as DataSource[],
      sessionInterface,
      GPUfiltering,
      positionOffset
    );

    // Tooltip
    layers_to_set.forEach((layer) => {
      layer.onHover = (info: PickingInfo<EarthQuake>) => {
        setHoverInfo(info);
        return true;
      };
    });

    return layers_to_set;
  }, [dataSources, positionOffset, sessionInterface, GPUfiltering]);

  // VIEWSTATE & RESET VIEW
  const [initialViewState, setInitialViewState] =
    useState<MapViewState>(INITIAL_VIEWSTATE);

  const flyToDataSource = () => {
    setInitialViewState({
      ...INITIAL_VIEWSTATE,
      transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
      transitionDuration: "auto",
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setInitialViewState(INITIAL_VIEWSTATE));

  // LOADING INDICATOR
  const [IsLoading, setIsLoading] = useState(true);

  const onMapLoad = () => {
    setIsLoading(false);
    console.log("loaded");
  };

  const deckRef = useRef(null);

  // const checkLayerLoad = useCallback(() => {
  //   if (layers) {
  //     const layerloading = layers
  //       .map((layer) => layer.isLoaded)
  //       .reduce(
  //         (accumulator: boolean, currentValue: boolean) =>
  //           accumulator && currentValue
  //       );

  //     if (!layerloading) {
  //       if (!IsLoading) {
  //         setIsLoading(true);
  //       }
  //     } else {
  //       if (IsLoading) {
  //         setIsLoading(false);
  //       }
  //     }
  //   }
  // }, [layers, IsLoading, setIsLoading]);

  return (
    <>
      <DeckGL
        ref={deckRef}
        views={new MapView({ farZMultiplier: 50 })}
        controller={{
          scrollZoom: { speed: 0.005, smooth: false },
          inertia: true,
        }}
        layers={[...layers]}
        initialViewState={initialViewState}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          backgroundColor: "var(--mui-palette-background-default)",
        }}
        onLoad={onMapLoad}
        // onBeforeRender={checkLayerLoad}
        // onAfterRender={checkLayerLoad}
      >
        {IsLoading && <LinearProgress variant="query" />}
        {hoverInfo && (
          <MapToolTip pickingInfo={hoverInfo} dataSources={dataSources} />
        )}
        <Button onClick={flyToDataSource} sx={{left: "36px"}}>reset view</Button>

        <ZoomWidget placement="top-left" />
        <FullscreenWidget placement="top-left" container={mapContainer.current} />
      </DeckGL>
    </>
  );
}
