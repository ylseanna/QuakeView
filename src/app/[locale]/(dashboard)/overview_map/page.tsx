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
import Actions from "@/components/datasource/actions";
import { useProjectStore } from "@/providers/project-store-provider";
import { useShallow } from "zustand/react/shallow";
import { useAppStateStore } from "@/providers/app-state-provider";
import { useTranslations } from "next-intl";

export default function Page() {
  const [IsLoading, setIsLoading] = useState(true);
  const theme = useTheme();
  const t = useTranslations();

  const { overViewState, setOverViewState } = useProjectStore(
    useShallow((state) => ({
      overViewState: state.sessionInterface.overViewState,
      setOverViewState: state.interfaceActions.setOverViewState,
    })),
  );

  const [mapTheme, setMapTheme] = useState<"US" | "Iceland" | "WorldCountries">(
    "Iceland",
  );

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
          {...(overViewState as object)}
          onMove={(evt) => setViewStateandLocalStorage(evt.viewState)}
          mapStyle={
            mapTheme == "Iceland"
              ? IcelandDEMStyle
              : mapTheme == "US"
                ? USDEMStyle
                : WorldCoastLines
          }
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
          {/* <FullscreenControl position="top-left" /> */}
          {appInterface.mapToolsVisible && (
            <>
              <NavigationControl position="top-left" />
              <Paper
                variant="outlined"
                sx={{
                  position: "fixed",
                  top: "calc(8px + 32px + 80px)",
                  left: "48px",
                  width: "200px",
                  p: 2,
                  backGroundColor: theme.palette.background.paper,
                  zIndex: theme.zIndex.appBar,
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {t("Map.styling")}
                </Typography>
                <Select
                  value={mapTheme}
                  fullWidth
                  onChange={(event) => {
                    setMapTheme(
                      event.target!.value as
                        | "Iceland"
                        | "US"
                        | "WorldCountries",
                    );
                  }}
                >
                  <MenuItem value={"Iceland"}>
                    DEM Iceland (Náttúrufræðistofnun)
                  </MenuItem>
                  <MenuItem value={"US"}>DEM United States (USGS)</MenuItem>
                  <MenuItem value={"WorldCountries"}>
                    World country outlines
                  </MenuItem>
                </Select>
              </Paper>
            </>
          )}

          <DeckGLlayers />
        </Map>
      </>
      <>
        <Actions />
      </>
    </>
  );
}
