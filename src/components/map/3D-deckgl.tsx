"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Earthquake, Extent } from "@/components/custom/types";
import { bbox } from "@turf/bbox";
import DeckGL from "@deck.gl/react";
import "@deck.gl/widgets/stylesheet.css";
import {
  FlyToInterpolator,
  MapView,
  MapViewState,
  PickingInfo,
  WebMercatorViewport,
} from "@deck.gl/core";
import { Button, useTheme } from "@mui/material";
import { generateDataSourceMapLayers } from "./generate-datasource-layers";
import MapToolTip from "./map-tooltip";
import { useProjectStore } from "@/providers/project-store-provider";
import { ScatterplotLayer } from "deck.gl";
import { DataFilterExtensionProps } from "@deck.gl/extensions";
import { useCatalogData } from "../data/use-data";
import { useAppStateStore } from "@/providers/app-state-provider";
import useExtents from "./use-extents";
import { ZoomWidget } from "@deck.gl/widgets";

import { CompassWidget } from "@deck.gl/widgets";
import {
  BOTTOMBAR_HEIGHT,
  DRAWER_HEIGHT,
} from "../interface/bottom-bar/bottom-bar";

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
  const mapContainer = useRef<HTMLElement>(null);

  const sessionInterface = useProjectStore((state) => state.sessionInterface);
  const GPUfiltering = useProjectStore((state) => state.GPUfiltering);
  const dataSources = useProjectStore((state) => state.dataSources);

  const { timelineBarVisible, bottombarVisible } = useAppStateStore(
    (state) => state.appInterface.views,
  );

  const { data } = useCatalogData();

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
  const extents = useExtents();

  const { threeDViewState } = useProjectStore(
    (state) => state.sessionInterface.threeD,
  );

  const { zoomTo } = useProjectStore((state) => state.sessionInterface.map);

  const { setThreeDViewState } = useProjectStore(
    (state) => state.interfaceActions.threeD,
  );

  const [initialViewState, setInitialViewState] =
    useState<MapViewState>(threeDViewState);

  useEffect(() => {
    if (extents.main && data.allIDs) {
      const viewportWebMercator = new WebMercatorViewport(threeDViewState);

      const [minLng, minLat, maxLng, maxLat] = bbox(extents.main);

      try {
        const { longitude, latitude, zoom } = viewportWebMercator.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          {
            padding: {
              top: 8,
              bottom:
                8 +
                (bottombarVisible ? BOTTOMBAR_HEIGHT : 0) +
                (timelineBarVisible ? DRAWER_HEIGHT : 0),
              left: 8,
              right: 8,
            },
          },
        );

        setInitialViewState({
          ...initialViewState,
          longitude: longitude,
          latitude: latitude,
          zoom: zoom,
        });
      } catch {}
    }
  }, [extents.main, data.allIDs]);

  useEffect(() => {
    const viewportWebMercator = new WebMercatorViewport(threeDViewState);

    const [minLng, minLat, maxLng, maxLat] = bbox(
      zoomTo != "all" && zoomTo ? extents.byID[zoomTo] : extents.main,
    );

    try {
      const { longitude, latitude, zoom } = viewportWebMercator.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        {
          padding: {
            top: 8,
            bottom:
              8 +
              (bottombarVisible ? BOTTOMBAR_HEIGHT : 0) +
              (timelineBarVisible ? DRAWER_HEIGHT : 0),
            left: 8,
            right: 8,
          },
        },
      );

      console.log(longitude, latitude, zoom);

      setInitialViewState({
        ...initialViewState,
        longitude: longitude,
        latitude: latitude,
        zoom: zoom,
        bearing: 0,
        pitch: 0,
        transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
        transitionDuration: "auto",
      });
    } catch {}

  }, [zoomTo]);

  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // useEffect(() => setInitialViewState(INITIAL_VIEWSTATE));

  const deckRef = useRef(null);

  const { mapToolsVisible } = useAppStateStore(
    (state) => state.appInterface.views,
  );

  // const theme = useTheme();

  return (
    <>
      <DeckGL
        ref={deckRef}
        views={new MapView({ farZMultiplier: 10000 })}
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
        onViewStateChange={({ viewState }) => {
          setThreeDViewState({ ...viewState });
        }}
      >
        {hoverInfo && <MapToolTip pickingInfo={hoverInfo} />}
        {/* {mapToolsVisible && (
          <>
            <Button
              onClick={() => flyToDataSource()}
              sx={{ left: "52px", top: "8px" }}
            >
              reset view
            </Button>
          </>
        )} */}
      </DeckGL>
    </>
  );
}
