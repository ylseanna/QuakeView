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
  const { data, addData, removeData } = useDataStore((state) => state);
  const [dataLoading, setDataLoading] = useState(false);
  const [debugVisible, setDebugVisible] = useState(false);

  useKeyStroke(["F3"], () => {
    setDebugVisible(!debugVisible);
  });

  useEffect(() => {
    dataSources.allIDs.forEach(async (id: string) => {
      if (data) {
        if (!Object.keys(data).includes(id)) {
          if (dataSources.byID[id].interface.loadable) {
            setDataLoading(true);
            setTimeout(async () => {
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
            }, 500);
          }
        }
        if (data[id]) {
          if (dataSources.byID[id].interface.loadable) {
            if (
              dataSources.byID[id].metadata.variables.added_vars.length !=
                data[id].addedVars.length ||
              dataSources.byID[id].filtering != data[id].filters
            ) {
              setDataLoading(true);
              setTimeout(async () => {
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
              }, 500);
            }
          } else {
            removeData(id);
          }
        }
      }
    });
  }, [data, addData, dataSources, removeData]);

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
