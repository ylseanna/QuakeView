"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Layer, ScaleControl } from "react-map-gl/maplibre";
import { createRef, useEffect, useMemo, useState } from "react";
import { ViewState } from "react-map-gl/maplibre";
import { bbox } from "@turf/bbox";

import DeckGLlayers from "@/components/map/deckgl-layers";

import { AttributionControl, type MapRef } from "react-map-gl/maplibre";
import { useProjectStore } from "@/providers/project-store-provider";
import { useShallow } from "zustand/react/shallow";
import { useAppStateStore } from "@/providers/app-state-provider";
// import { GeoGrid } from "geogrid-maplibre-gl";

import {
  BOTTOMBAR_HEIGHT,
  DRAWER_HEIGHT,
} from "@/components/interface/bottom-bar/bottom-bar";
import { useMapStyle, useExtentLayers } from "@/components/map/use-map-style";
import { useExtentPolygons } from "@/components/map/use-extents";
import { useTheme } from "@mui/material/styles";

export default function Page() {
  const [IsLoading, setIsLoading] = useState(true);
  const theme = useTheme()

  const mapRef = createRef<MapRef>();

  // const graticuleRef = createRef<GeoGrid>();

  // const geogrid = useMemo(() => mapRef.current && [mapRef]);

  const { overViewState, setOverViewState, zoomTo, setZoomToTarget } =
    useProjectStore(
      useShallow((state) => ({
        overViewState: state.sessionInterface.map.mapViewState,
        zoomTo: state.sessionInterface.map.zoomTo,
        setOverViewState: state.interfaceActions.map.setMapViewState,
        setZoomToTarget: state.interfaceActions.map.setZoomToTarget,
      })),
    );

  const { showExtents } = useProjectStore(
    (state) => state.sessionInterface.map,
  );

  const onMapLoad = () => {
    setIsLoading(false);

    console.log(mapRef.current?.getMap());

    // if (mapRef.current) {
    //   graticuleRef.current = new GeoGrid({
    //     map: mapRef.current.getMap(),
    //     beforeLayerId: "joklar",
    //     gridStyle: {
    //       color: theme.palette.divider,
    //       width: 0.5,
    //     },
    //     labelStyle: {
    //       color: "rgba(0, 0, 0, 0.3)",
    //       fontSize: ".7rem",
    //     },
    //     zoomLevelRange: [0, 22],
    //     gridDensity: (zoomLevel) => zoomLevel != 0 ? 1 : 10,
    //     formatLabels: (degreesFloat) => String(degreesFloat),
    //   });
    // }
  };

  function setViewStateandLocalStorage(viewState: ViewState) {
    if (IsLoading == false) {
      setOverViewState(viewState);
      setZoomToTarget(null);
    }
  }

  const { mapStyle } = useMapStyle();

  const extents = useExtentPolygons();

  const { bottombarVisible, timelineBarVisible } = useAppStateStore(
    (state) => state.appInterface.views,
  );

  useEffect(() => {
    if (zoomTo && mapRef.current) {
      const [minLng, minLat, maxLng, maxLat] = bbox(
        zoomTo != "all"
          ? extents.byID[zoomTo] && extents.byID[zoomTo]
          : extents.main,
      );

      mapRef.current.fitBounds(
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
          duration: 1000,
        },
      );
    }
  }, [zoomTo]);

  const extentLayers = useExtentLayers();

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
      {showExtents && <Layer {...extentLayers["mainExtent"]} />}
    </Map>
  );
}
