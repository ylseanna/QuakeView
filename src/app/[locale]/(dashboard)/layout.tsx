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
  const {
    allIDs: allLoadedIDs,
    addData,
    removeData,
  } = useDataStore((state) => state);
  const [dataLoading, setDataLoading] = useState([] as string[]);
  const [debugVisible, setDebugVisible] = useState(false);

  useKeyStroke(["F3"], () => {
    setDebugVisible(!debugVisible);
  });

  const setColorFormatting = useProjectStore(
    (state) => state.dataSourceActions.setColorFormatting,
  );

  // load data

  useEffect(() => {
    console.log(
      `Check load;\nloaded data ids: ${allLoadedIDs.join(", ")}\nCurrently loading data ids: ${dataLoading.join(", ")}`,
    );
    dataSources.allIDs.forEach(async (dataSourceID: string) => {
      console.log(`Load check for ${dataSourceID}`);

      if (!dataSources.byID[dataSourceID].interface.loadable) {
        console.log("DataSource not marked as loadable");
        if (allLoadedIDs.includes(dataSourceID)) {
          console.log("DataSource included in loaded data, oh no, removing");
          removeData(dataSourceID);
        } else {
          console.log("DataSource not included in loaded data, yay");
        }
      } else {
        console.log("DataSource marked as loadable");
        if (allLoadedIDs.includes(dataSourceID)) {
          console.log("DataSource included in loaded data, yay");
        } else {
          console.log(
            "DataSource not included in loaded data, it should be loaded",
          );
          if (dataLoading.includes(dataSourceID)) {
            console.log(
              "The DataSource or another is already being loaded, waiting for next attempt to avoid double-loading",
            );
          } else {
            console.log(`Fetching data for ${dataSourceID}`);
            setDataLoading([...dataLoading, dataSourceID]);

            await fetchData(dataSources.byID[dataSourceID])
              .then((fetched_data) => {
                console.log(fetched_data);

                addData(
                  dataSourceID,
                  fetched_data.data,
                  dataSources.byID[dataSourceID].metadata.variables.added_vars,
                  fetched_data.bounds,
                  fetched_data.extent,
                  dataSources.byID[dataSourceID].filtering,
                );

                // Add color maps boundaries from data
                const boundsFromData = {} as {
                  [variable: string]: [number, number] | null;
                };

                Object.keys(
                  dataSources.byID[dataSourceID].formatting.color.linear.domain,
                )
                  .concat(["t"])
                  .forEach((variable) => {
                    boundsFromData[variable] = fetched_data.bounds[variable];
                  });

                setColorFormatting(dataSourceID, {
                  ...dataSources.byID[dataSourceID].formatting.color,
                  linear: {
                    ...dataSources.byID[dataSourceID].formatting.color.linear,
                    domain: boundsFromData,
                  },
                });

                console.log(dataSources.byID[dataSourceID].formatting.color);

                // remove ID from data that is loading (this still doesn't seem to completely work though)
                setDataLoading(
                  (dataLoading as string[]).splice(
                    (dataLoading as string[]).findIndex(
                      (iid) => iid === dataSourceID,
                    ),
                    1,
                  ),
                );
              })
              .catch((err) => {
                console.log("Server responded with error", err);

                // remove ID from data that is loading (this still doesn't seem to completely work though)
                setDataLoading(
                  (dataLoading as string[]).splice(
                    (dataLoading as string[]).findIndex(
                      (iid) => iid === dataSourceID,
                    ),
                    1,
                  ),
                );
              });
          }
        }
      }
    });
  }, [dataSources]);

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
          {dataLoading.length != 0 && <LinearProgress />}
          {props.children}
        </Suspense>
      </Box>
    </>
  );
}
