"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useMemo, useRef, useState } from "react";
import { Earthquake, Extent } from "@/components/datasource/types";

import DeckGL, { FullscreenWidget, ZoomWidget } from "@deck.gl/react";
import "@deck.gl/widgets/stylesheet.css";
import {
  FlyToInterpolator,
  MapView,
  MapViewState,
  PickingInfo,
} from "@deck.gl/core";
import { Button } from "@mui/material";
import { generateDataSourceMapLayers } from "./generate-datasource-layers";
import MapToolTip from "./map-tooltip";
import { useProjectStore } from "@/providers/project-store-provider";
import { ScatterplotLayer } from "deck.gl";
import { DataFilterExtensionProps } from "@deck.gl/extensions";
import { useData } from "../datasource/use-data";
import { useAppStateStore } from "@/providers/app-state-provider";

// import { GeoJsonLayer } from "@deck.gl/layers";
// import { TerrainLayer } from "@deck.gl/geo-layers";
// import { MaskExtension } from "@deck.gl/extensions";
// import { TerrainLoader } from "@loaders.gl/terrain";

// import { GeoJsonLayer } from "@deck.gl/layers";

interface DeckGLProps {
  extent: Extent | null;
  positionOffset: number;
}

export default function ThreeDDeckGLView({
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
    [extent],
  );

  const mapContainer = useRef<HTMLElement>(null);

  const sessionInterface = useProjectStore((state) => state.sessionInterface);
  const GPUfiltering = useProjectStore((state) => state.GPUfiltering);
  const dataSources = useProjectStore((state) => state.dataSources);

  const { data } = useData();

  useEffect(() => {
    mapContainer.current = document.getElementsByTagName("main")[0];
  }, [mapContainer]);

  // TOOLTIP

  const [hoverInfo, setHoverInfo] = useState<PickingInfo<Earthquake>>();

  // LAYERS
  const layers = useMemo(() => {
    let layers_to_set = [] as ScatterplotLayer<
      Earthquake,
      DataFilterExtensionProps
    >[];

    if (data) {
      layers_to_set = data.allIDs.map((id: string) => {
        const layer = generateDataSourceMapLayers(
          "threeD",
          dataSources.byID[id],
          data.byID[id].data,
          sessionInterface,
          GPUfiltering,
          positionOffset,
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
    positionOffset,
  ]);

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

  const deckRef = useRef(null);

  // const terrainlayer = useMemo(
  //   () =>
  //     new TerrainLayer({
  //       elevationData: "/api/tiles/{z}/{x}/{y}.png",

  //       loaders: [TerrainLoader],
  //       elevationDecoder: {
  //         rScaler: 4,
  //         gScaler: 0,
  //         bScaler: 0,
  //         offset: 0,
  //       },
  //       visible: false,
  //       fp64: true,
  //       maxZoom: 12,
  //       meshMaxError: 0,
  //       tesselator: "martini",
  //       getTranslation: [0,0, positionOffset],

  //       opacity: 1,
  //       extensions: [new MaskExtension()],
  //       maskByInstance: true,
  //       maskId: "geofence",
  //     }),
  //   [positionOffset]
  // );

  // const maskLayer = useMemo(
  //   () =>
  //     new GeoJsonLayer({
  //       id: "geofence",
  //       data: "/geojsonfiles/coastline.geojson",
  //       operation: "mask",
  //     }),
  //   []
  // );

  const { appInterface } = useAppStateStore((state) => state);

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
        useDevicePixels={false}
        // onLoad={onMapLoad}
      >
        {/* {IsLoading && <LinearProgress variant="query" />} */}
        {hoverInfo && <MapToolTip pickingInfo={hoverInfo} />}
        {appInterface.mapToolsVisible && (
          <>
            <Button onClick={flyToDataSource} sx={{ left: "36px" }}>
              reset view
            </Button>
            <ZoomWidget placement="top-left" />
            <FullscreenWidget
              placement="top-left"
              container={mapContainer.current!}
            />
          </>
        )}
      </DeckGL>
    </>
  );
}
