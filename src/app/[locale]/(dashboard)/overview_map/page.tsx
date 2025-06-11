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
import { useLocalStorageState } from "@toolpad/core";
import { VIEWSTATE_JSON_CODEC } from "../../../../components/map/types";
import {
  DataSource,
  DATASOURCE_JSON_CODEC,
} from "../../../../components/datasource/types";
import { AttributionControl } from "react-map-gl";
import Actions from "../../../../components/datasource/actions";

export default function Page() {
  const [IsLoading, setIsLoading] = useState(true);

  // bounds
  const [viewState, setViewState] = useLocalStorageState<ViewState>(
    "overview-view-state",
    {
      longitude: -19,
      latitude: 65,
      zoom: 6,
      pitch: 0,
    } as ViewState,
    { codec: VIEWSTATE_JSON_CODEC }
  );

  const [dataSources, setDataSources] = useLocalStorageState<DataSource[]>(
    "data-sources",
    [],
    {
      codec: DATASOURCE_JSON_CODEC,
    }
  );

  const onMapLoad = () => {
    setIsLoading(false);
  };

  function setViewStateandLocalStorage(viewState: ViewState) {
    if (IsLoading == false) {
      setViewState(viewState);
    }
  }

  return (
    <>
      {/* <FormattingSidebar
        dataSources={dataSources as DataSource[]}
        setDataSources={setDataSources}
      /> */}

      {IsLoading && <LinearProgress />}
      <>
        <Map
          onLoad={onMapLoad}
          reuseMaps
          {...(viewState as object)}
          onMove={(evt) => setViewStateandLocalStorage(evt.viewState)}
          mapStyle={defaultDEMStyle}
          maxBounds={[
            [-30, 61],
            [-7, 68],
          ]}
          style={{
            width: "100%",
            height: "calc(100vh - 64px)",
            position: "absolute"
          }}
          maxPitch={0}
          attributionControl={false}
        >
          <ScaleControl position="bottom-left" />
          <AttributionControl position="bottom-left" />
          <FullscreenControl position="top-left" />
          <NavigationControl position="top-left" />

          <DeckGLlayers dataSources={dataSources} />
        </Map>
      </>
      <>
        <Actions dataSources={dataSources!} setDataSources={setDataSources} />
      </>
    </>
  );
}
