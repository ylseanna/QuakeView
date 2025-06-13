"use client";

import { defaultDEMStyle } from "../../../../components/map/map_styles/default";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, {
  FullscreenControl,
  ScaleControl,
  NavigationControl,
} from "react-map-gl/maplibre";
import { useEffect, useState } from "react";
import { LinearProgress } from "@mui/material";
import { ViewState } from "react-map-gl/maplibre";

import DeckGLlayers from "../../../../components/map/deckgl-layers";
import { useLocalStorageState } from "@toolpad/core";
import { VIEWSTATE_JSON_CODEC } from "../../../../components/map/types";
import { AttributionControl } from "react-map-gl";
import Actions from "../../../../components/datasource/actions";
import { useDataStore } from "@/providers/data-store-provider";
import { useProjectStore } from "@/providers/project-store-provider";
import { fetchData } from "@/components/datasource/load-data";

export default function Page() {
  const [IsLoading, setIsLoading] = useState(true);

  // load data (synchronized accros app)
  const { dataSources } = useProjectStore((state) => state);
  const { data, addData } = useDataStore((state) => state);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    dataSources.allIDs.forEach(async (id: string) => {
      if (!Object.keys(data).includes(id)) {
        setDataLoading(true);

        const fetched_data = await fetchData(dataSources.byID[id]);
        console.log(fetched_data);

        addData(id, fetched_data, dataSources.byID[id].interface.addedVars);

        setDataLoading(false);
      } else if (
        !(
          JSON.stringify(data[id].addedVars.sort()) ===
          JSON.stringify(dataSources.byID[id].interface.addedVars.sort())
        ) // check for equality
      ) {
        setDataLoading(true);

        const fetched_data = await fetchData(dataSources.byID[id]);
        console.log(fetched_data);

        addData(id, fetched_data, dataSources.byID[id].interface.addedVars);

        setDataLoading(false);
      }
    });
  }, [data, addData, dataSources]);

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

      {(IsLoading || dataLoading ) && <LinearProgress />}
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
            height: "calc(100vh - 64px - 30px)",
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
