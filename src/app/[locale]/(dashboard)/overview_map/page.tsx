"use client";

import {
  IcelandDEMStyle,
  USDEMStyle,
  WorldCoastLines,
} from "@/components/map/map_styles/default";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, { ScaleControl, NavigationControl } from "react-map-gl/maplibre";
import { useState } from "react";
import {
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Typography,
  useTheme,
} from "@mui/material";
import { ViewState } from "react-map-gl/maplibre";

import DeckGLlayers from "@/components/map/deckgl-layers";

import { AttributionControl } from "react-map-gl";
import { useProjectStore } from "@/providers/project-store-provider";
import { useShallow } from "zustand/react/shallow";
import { useAppStateStore } from "@/providers/app-state-provider";
import { useTranslations } from "next-intl";
import {
  BOTTOMBAR_HEIGHT,
  DRAWER_HEIGHT,
} from "@/components/interface/bottom-bar/bottom-bar";

export default function Page() {
  const [IsLoading, setIsLoading] = useState(true);
  const theme = useTheme();
  const t = useTranslations();

  const { overViewState, setOverViewState } = useProjectStore(
    useShallow((state) => ({
      overViewState: state.sessionInterface.map.mapViewState,
      setOverViewState: state.interfaceActions.map.setMapViewState,
    })),
  );

  const { mapStyle } = useProjectStore((state) => state.sessionInterface.map);

  // const [mapTheme, setMapTheme] = useState<"US" | "Iceland" | "WorldCountries">(
  //   "Iceland",
  // );

  const onMapLoad = () => {
    setIsLoading(false);
  };

  function setViewStateandLocalStorage(viewState: ViewState) {
    if (IsLoading == false) {
      setOverViewState(viewState);
    }
  }

  const { appInterface } = useAppStateStore((state) => state);

  return (
    <>
      {IsLoading && <LinearProgress />}
      <>
        <Map
          onLoad={onMapLoad}
          reuseMaps
          {...overViewState}
          onMove={(evt) => setViewStateandLocalStorage(evt.viewState)}
          mapStyle={
            mapStyle == "Iceland"
              ? IcelandDEMStyle
              : mapStyle == "US"
                ? USDEMStyle
                : WorldCoastLines
          }
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
              transform: appInterface.timelineBarVisible
                ? appInterface.bottombarVisible
                  ? `translateY(-${DRAWER_HEIGHT + BOTTOMBAR_HEIGHT}px)`
                  : `translateY(-${DRAWER_HEIGHT}px)`
                : appInterface.bottombarVisible
                  ? `translateY(-${BOTTOMBAR_HEIGHT}px)`
                  : `translateY( 0)`,
              transition: "transform.225s",
            }}
          />
          <AttributionControl
            position="bottom-left"
            style={{
              transform: appInterface.timelineBarVisible
                ? appInterface.bottombarVisible
                  ? `translateY(-${DRAWER_HEIGHT + BOTTOMBAR_HEIGHT}px)`
                  : `translateY(-${DRAWER_HEIGHT}px)`
                : appInterface.bottombarVisible
                  ? `translateY(-${BOTTOMBAR_HEIGHT}px)`
                  : `translateY( 0)`,
              transition: "transform.225s",
            }}
          />
          {/* <FullscreenControl position="top-left" /> */}
          {appInterface.mapToolsVisible && (
            <NavigationControl position="top-left" />
          )}

          <DeckGLlayers />
        </Map>
      </>
    </>
  );
}
