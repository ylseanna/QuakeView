"use client";

import {
  IcelandDEMStyle,
  USDEMStyle,
} from "../../../../components/map/map_styles/default";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, {
  FullscreenControl,
  ScaleControl,
  NavigationControl,
} from "react-map-gl/maplibre";
import { useState } from "react";
import {
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  useTheme,
} from "@mui/material";
import { ViewState } from "react-map-gl/maplibre";

import DeckGLlayers from "../../../../components/map/deckgl-layers";

import { AttributionControl } from "react-map-gl";
import Actions from "../../../../components/datasource/actions";
import { useProjectStore } from "@/providers/project-store-provider";
import { useShallow } from "zustand/react/shallow";
import { useIsFetching } from "@tanstack/react-query";

export default function Page() {
  const [IsLoading, setIsLoading] = useState(true);
  const theme = useTheme();

  const { overViewState, setOverViewState } = useProjectStore(
    useShallow((state) => ({
      overViewState: state.sessionInterface.overViewState,
      setOverViewState: state.interfaceActions.setOverViewState,
    })),
  );

  const [mapTheme, setMapTheme] = useState<"US" | "Iceland">("Iceland");

  const onMapLoad = () => {
    setIsLoading(false);
  };

  function setViewStateandLocalStorage(viewState: ViewState) {
    if (IsLoading == false) {
      setOverViewState(viewState);
    }
  }

  const isFetching = useIsFetching()

  return (
    <>
      {(IsLoading || isFetching) && <LinearProgress />}
      <>
        <Paper
          variant="outlined"
          sx={{
            position: "fixed",
            top: "calc(8px + 32px + 80px)",
            left: "48px",
            width: "200px",
            height: "120px",
            p: 2,
            backGroundColor: theme.palette.background.paper,
            zIndex: theme.zIndex.appBar,
          }}
        >
          <Select
            value={mapTheme}
            fullWidth
            onChange={(event) => {
              setMapTheme(event.target!.value as "Iceland" | "US");
            }}
          >
            <MenuItem value={"Iceland"}>
              DEM Iceland (Náttúrufræðistofnun)
            </MenuItem>
            <MenuItem value={"US"}>DEM United States (USGS)</MenuItem>
          </Select>
        </Paper>

        <Map
          onLoad={onMapLoad}
          reuseMaps
          {...(overViewState as object)}
          onMove={(evt) => setViewStateandLocalStorage(evt.viewState)}
          mapStyle={mapTheme == "Iceland" ? IcelandDEMStyle : USDEMStyle}
          // maxBounds={[
          //   [180, 90],
          //   [-180, -90],
          // ]}
          style={{
            width: "100%",
            height: "calc(100vh - 80px - 32px)",
            position: "absolute",
          }}
          maxPitch={0}
          attributionControl={false}
        >
          <ScaleControl position="bottom-left" />
          <AttributionControl position="bottom-left" />
          <FullscreenControl position="top-left" />
          <NavigationControl position="top-left" />

          <DeckGLlayers />
        </Map>
      </>
      <>
        <Actions />
      </>
    </>
  );
}
