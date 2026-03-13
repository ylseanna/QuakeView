"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useMemo, useRef, useState } from "react";
import { Earthquake, Extent } from "@/components/custom/types";
import DeckGL, { DeckGLRef } from "@deck.gl/react";
import "@deck.gl/widgets/stylesheet.css";
import {
  FlyToInterpolator,
  MapView,
  MapViewState,
  PickingInfo,
  WebMercatorViewport,
} from "@deck.gl/core";
import { generateDataSourceMapLayers } from "./generate-datasource-layers";
import MapToolTip from "./map-tooltip";
import { useProjectStore } from "@/providers/project-store-provider";
import { ScatterplotLayer } from "deck.gl";
import { DataFilterExtensionProps } from "@deck.gl/extensions";
import { useCatalogData } from "../data/use-data";
import { useAppStateStore } from "@/providers/app-state-provider";
import { useCentroids, useExtents } from "./use-extents";

import {
  BOTTOMBAR_HEIGHT,
  DRAWER_HEIGHT,
} from "../interface/bottom-bar/bottom-bar";
import { useKeyDown } from "@react-hooks-library/core";

// import { GeoJsonLayer } from "@deck.gl/layers";
// import { TerrainLayer } from "@deck.gl/geo-layers";
// import { MaskExtension } from "@deck.gl/extensions";
// import { TerrainLoader } from "@loaders.gl/terrain";

// import { GeoJsonLayer } from "@deck.gl/layers";

export default function ThreeDDeckGLView() {
  const mapContainer = useRef<HTMLElement>(null);

  const sessionInterface = useProjectStore((state) => state.sessionInterface);
  const GPUfiltering = useProjectStore((state) => state.GPUfiltering);
  const dataSources = useProjectStore((state) => state.dataSources);

  const { timelineBarVisible, bottombarVisible } = useAppStateStore(
    (state) => state.appInterface.views,
  );

  const { setZoomToTarget } = useProjectStore(
    (state) => state.interfaceActions.map,
  );

  const { elevationOffset } = useProjectStore(
    (state) => state.sessionInterface.threeD,
  );

  const { setElevationOffset } = useProjectStore(
    (state) => state.interfaceActions.threeD,
  );

  useKeyDown(["PageDown"], (e) => {
    setElevationOffset(Math.round((elevationOffset - 0.1) * 10) / 10);
    e.preventDefault();
  });

  useKeyDown(["PageUp"], (e) => {
    setElevationOffset(Math.round((elevationOffset + 0.1) * 10) / 10);
    e.preventDefault();
  });

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
          elevationOffset,
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
    elevationOffset,
  ]);

  // VIEWSTATE & RESET VIEW
  const extents = useExtents("threeD");

  const centroids = useCentroids();

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
    if (extents.main && data.allIDs && centroids.main) {
      const viewportWebMercator = new WebMercatorViewport(threeDViewState);

      const [minLng, minLat, minDep, maxLng, maxLat, maxDep] = extents.main as [
        number,
        number,
        number,
        number,
        number,
        number,
      ];

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

        setElevationOffset(-Math.round(centroids.main[2] * 10) / 10);
      } catch {}
    }
  }, [data.allIDs]);

  useEffect(() => {
    if (extents.main && data.allIDs) {
      const viewportWebMercator = new WebMercatorViewport(threeDViewState);

      const [minLng, minLat, minDep, maxLng, maxLat, maxDep] =
        zoomTo != "all" && zoomTo
          ? (extents.byID[zoomTo] as [
              number,
              number,
              number,
              number,
              number,
              number,
            ])
          : (extents.main as [number, number, number, number, number, number]);

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

        deckRef.current!.deck?.setProps({
          initialViewState: {
            ...initialViewState,
            longitude: longitude,
            latitude: latitude,
            zoom: zoom,
            transitionInterpolator: new FlyToInterpolator(),
            transitionDuration: 300,
          },
        });
      } catch {}
    }
  }, [zoomTo]);

  const deckRef = useRef<DeckGLRef<MapView>>(null);

  const [viewStateMonitor, setViewStateMonitor] = useState<MapViewState>();

  useEffect(() => {
    viewStateMonitor && setThreeDViewState(viewStateMonitor);
  }, [viewStateMonitor]);

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
        onViewStateChange={(changeParameters) => {
          if (!changeParameters.interactionState.inTransition) {
            setViewStateMonitor(changeParameters.viewState);
            setZoomToTarget(null);
          }
        }}
      />
      {hoverInfo && <MapToolTip pickingInfo={hoverInfo} />}
    </>
  );
}
