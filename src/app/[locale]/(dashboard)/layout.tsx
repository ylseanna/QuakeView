/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Box, LinearProgress } from "@mui/material";

import { useDataStore } from "@/providers/data-store-provider";
import { fetchData } from "@/components/datasource/load-data";
import { useProjectStore } from "@/providers/project-store-provider";
import { ReactNode, Suspense, useEffect, useState } from "react";

// import { isEmpty, xor } from "lodash";
import TitleBar from "@/components/navigation/title-bar";
import NavBar from "@/components/navigation/nav-bar";
import { useKeyStroke } from "@react-hooks-library/core";
import DebugWindow from "@/components/interface/debug-window";

export default function DashboardPagesLayout(props: { children: ReactNode }) {
  // load data (synchronized accros app)
  const { dataSources } = useProjectStore((state) => state);
  const { data, allIDs, addData, removeData } = useDataStore((state) => state);
  const [dataLoading, setDataLoading] = useState(false);
  const [debugVisible, setDebugVisible] = useState(false);

  useKeyStroke(["F3"], () => {
    setDebugVisible(!debugVisible);
  });

  useEffect(() => {
    console.log(`All loaded data ids: ${allIDs.join(",")}`);
    if (!dataLoading) {
      dataSources.allIDs.forEach(async (id: string) => {
        if (data) {
          if (!allIDs.includes(id)) {
            if (dataSources.byID[id].interface.loadable) {
              console.log(
                `Data not loaded for ${id} (all loaded: ${allIDs.join(",")}), starting fetch`,
              );

              setDataLoading(true);
              console.log(`Fetching data for ${id}`);

              await fetchData(dataSources.byID[id]).then((fetched_data) => {
                console.log(fetched_data);

                addData(
                  id,
                  fetched_data.data,
                  dataSources.byID[id].metadata.variables.added_vars,
                  fetched_data.bounds,
                  fetched_data.extent,
                  dataSources.byID[id].filtering,
                );

                setDataLoading(false);
              });
            }
          } else {
            if (dataSources.byID[id].interface.loadable) {
              if (
                dataSources.byID[id].metadata.variables.added_vars.length !=
                  data[id].addedVars.length ||
                dataSources.byID[id].filtering != data[id].filters
              ) {
                console.log(
                  `Data parameters have changed for ${id}, starting fetch`,
                );
                setDataLoading(true);
                console.log(`Fetching data for ${id}`);

                await fetchData(dataSources.byID[id]).then((fetched_data) => {
                  console.log(fetched_data);

                  addData(
                    id,
                    fetched_data.data,
                    dataSources.byID[id].metadata.variables.added_vars,
                    fetched_data.bounds,
                    fetched_data.extent,
                    dataSources.byID[id].filtering,
                  );

                  setDataLoading(false);
                });
              }
            } else {
              removeData(id);
            }
          }
        }
      });
    }
  }, [dataSources.allIDs, dataLoading]);

  return (
    <>
      {debugVisible && <DebugWindow />}
      <TitleBar />
      <NavBar />
      <Box
        sx={{
          height: "calc(100vh - 32px - 64px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Suspense fallback={<LinearProgress />}>
          {dataLoading && <LinearProgress />}
          {props.children}
        </Suspense>
      </Box>
    </>
  );
}
