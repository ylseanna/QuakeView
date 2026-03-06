"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, { ScaleControl } from "react-map-gl/maplibre";
import { createRef, useEffect, useState } from "react";
import { ViewState } from "react-map-gl/maplibre";
import { bbox } from "@turf/bbox";

import DeckGLlayers from "@/components/map/deckgl-layers";

import { AttributionControl, type MapRef } from "react-map-gl/maplibre";
import { useProjectStore } from "@/providers/project-store-provider";
import { useShallow } from "zustand/react/shallow";
import { useAppStateStore } from "@/providers/app-state-provider";
import {
  BOTTOMBAR_HEIGHT,
  DRAWER_HEIGHT,
} from "@/components/interface/bottom-bar/bottom-bar";
import useMapStyle from "@/components/map/use-map-style";
import useExtents from "@/components/map/use-extents";

export default function Page() {
  const [IsLoading, setIsLoading] = useState(true);

  const mapRef = createRef<MapRef>();

  const { overViewState, setOverViewState, zoomTo, setZoomToTarget } = useProjectStore(
    useShallow((state) => ({
      overViewState: state.sessionInterface.map.mapViewState,
      zoomTo: state.sessionInterface.map.zoomTo,
      setOverViewState: state.interfaceActions.map.setMapViewState,
      setZoomToTarget: state.interfaceActions.map.setZoomToTarget,
    })),
  );

  const onMapLoad = () => {
    setIsLoading(false);
  };

  function setViewStateandLocalStorage(viewState: ViewState) {
    if (IsLoading == false) {
      setOverViewState(viewState);
      setZoomToTarget(null)
    }
  }

  const { mapStyle } = useMapStyle();

  const extents = useExtents();

  const { bottombarVisible, timelineBarVisible } = useAppStateStore(
    (state) => state.appInterface.views,
  );

  useEffect(() => {
    if (zoomTo && extents.byID[zoomTo] && mapRef.current) {
        const [minLng, minLat, maxLng, maxLat] = bbox(
          zoomTo != "all" ? extents.byID[zoomTo] : extents.main,
        );

        mapRef.current.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          { padding: {top: 8, bottom: 8 + (bottombarVisible ? BOTTOMBAR_HEIGHT : 0) + (timelineBarVisible ? DRAWER_HEIGHT : 0), left: 8, right: 8}, duration: 1000 },
        );
    }
  }, [zoomTo]);

  return (
    <Map
      ref={mapRef}
      onLoad={onMapLoad}
      reuseMaps
      {...overViewState}
      onMove={(evt) => setViewStateandLocalStorage(evt.viewState)}
      mapStyle={mapStyle}
      // maxBounds={[
      //   [180, 90],
      //   [-180, -90],
      // ]}
      style={{
        width: "100%",
        height: `calc(100vh - 80px - 32px)`,
        position: "absolute",
      }}
      maxPitch={0}
      attributionControl={false}
    >
      <ScaleControl
        position="bottom-left"
        style={{
          transform: timelineBarVisible
            ? bottombarVisible
              ? `translateY(-${DRAWER_HEIGHT + BOTTOMBAR_HEIGHT}px)`
              : `translateY(-${DRAWER_HEIGHT}px)`
            : bottombarVisible
              ? `translateY(-${BOTTOMBAR_HEIGHT}px)`
              : `translateY( 0)`,
          transition: "transform.225s",
        }}
      />
      <AttributionControl
        position="bottom-left"
        style={{
          transform: timelineBarVisible
            ? bottombarVisible
              ? `translateY(-${DRAWER_HEIGHT + BOTTOMBAR_HEIGHT}px)`
              : `translateY(-${DRAWER_HEIGHT}px)`
            : bottombarVisible
              ? `translateY(-${BOTTOMBAR_HEIGHT}px)`
              : `translateY( 0)`,
          transition: "transform.225s",
        }}
      />
      <DeckGLlayers />
    </Map>
  );
}
