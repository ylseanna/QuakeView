"use client";

import { defaultDEMStyle } from "../../../../components/map/map_styles/default";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, {
  FullscreenControl,
  ScaleControl,
  NavigationControl,
} from "react-map-gl/maplibre";
import { useState } from "react";
import { LinearProgress } from "@mui/material";
import { ViewState } from "react-map-gl/maplibre";

import DeckGLlayers from "../../../../components/map/deckgl-layers";

import { AttributionControl } from "react-map-gl";
import Actions from "../../../../components/datasource/actions";
import { useProjectStore } from "@/providers/project-store-provider";
import { useShallow } from "zustand/react/shallow";

export default function Page() {
  const [IsLoading, setIsLoading] = useState(true);

  const { overViewState, setOverViewState } = useProjectStore(
    useShallow((state) => ({
      overViewState: state.sessionInterface.overViewState,
      setOverViewState: state.interfaceActions.setOverViewState,
    })),
  );

  const onMapLoad = () => {
    setIsLoading(false);
  };

  function setViewStateandLocalStorage(viewState: ViewState) {
    if (IsLoading == false) {
      setOverViewState(viewState);
    }
  }

  return (
    <>
      {IsLoading && <LinearProgress />}
      <>
        <Map
          onLoad={onMapLoad}
          reuseMaps
          {...(overViewState as object)}
          onMove={(evt) => setViewStateandLocalStorage(evt.viewState)}
          mapStyle={defaultDEMStyle}
          maxBounds={[
            [-30, 61],
            [-7, 68],
          ]}
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
