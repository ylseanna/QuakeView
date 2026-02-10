"use client";

import { Box, LinearProgress } from "@mui/material";

import { ReactNode, Suspense, useState } from "react";

import TitleBar from "@/components/navigation/title-bar";
import NavBar from "@/components/navigation/nav-bar";
import { useKeyStroke } from "@react-hooks-library/core";
import DebugWindow from "@/components/interface/debug-window";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function DashboardPagesLayout(props: { children: ReactNode }) {
  const [debugVisible, setDebugVisible] = useState(false);

  useKeyStroke(["F3"], () => {
    setDebugVisible(!debugVisible);
  });


  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });

  // load data

  // const LoadData = async (dataSourceID: string) => {
  //   await fetchData(dataSources.byID[dataSourceID])
  //     .then((fetched_data) => {
  //       console.log(fetched_data);

  //       addData(
  //         dataSourceID,
  //         fetched_data.data,
  //         dataSources.byID[dataSourceID].metadata.variables.added_vars,
  //         fetched_data.bounds,
  //         fetched_data.extent,
  //         dataSources.byID[dataSourceID].filtering,
  //       );

  //       // Add color maps boundaries from data
  //       const boundsFromData = {} as {
  //         [variable: string]: [number, number] | null;
  //       };

  //       Object.keys(
  //         dataSources.byID[dataSourceID].formatting.color.linear.domain,
  //       )
  //         .concat(["t"])
  //         .forEach((variable) => {
  //           boundsFromData[variable] = fetched_data.bounds[variable];
  //         });

  //       setColorFormatting(dataSourceID, {
  //         ...dataSources.byID[dataSourceID].formatting.color,
  //         linear: {
  //           ...dataSources.byID[dataSourceID].formatting.color.linear,
  //           domain: boundsFromData,
  //         },
  //       });

  //       console.log(dataSources.byID[dataSourceID].formatting.color);

  //       console.log(dataLoading);

  //       // remove ID from data that is loading (this still doesn't seem to completely work though)
  //     })
  //     .catch((err) => {
  //       console.log("Server responded with error", err);

  //       // remove ID from data that is loading (this still doesn't seem to completely work though)
  //     });
  // };

  // useEffect(() => {
  //   console.log(`Check load;\nloaded data ids: ${allLoadedIDs.join(", ")}`);
  //   dataSources.allIDs.forEach((dataSourceID: string) => {
  //     console.log(`Load check for ${dataSourceID}`);

  //     if (!dataSources.byID[dataSourceID].interface.loadable) {
  //       console.log("DataSource not marked as loadable");
  //       if (allLoadedIDs.includes(dataSourceID)) {
  //         console.log("DataSource included in loaded data, oh no, removing");
  //         removeData(dataSourceID);
  //       } else {
  //         console.log("DataSource not included in loaded data, yay");
  //       }
  //     } else {
  //       console.log("DataSource marked as loadable");
  //       if (allLoadedIDs.includes(dataSourceID)) {
  //         console.log("DataSource included in loaded data, yay");
  //       } else {
  //         console.log(
  //           "DataSource not included in loaded data, it should be loaded",
  //         );
  //         if (dataLoading) {
  //           console.log(
  //             "The DataSource or another is already being loaded, waiting for next attempt to avoid double-loading",
  //           );
  //         } else {
  //           console.log(`Fetching data for ${dataSourceID}`);
  //           setDataLoading(true);

  //           LoadData(dataSourceID);

  //           setDataLoading(false);
  //         }
  //       }
  //     }
  //   });
  // }, [dataSources, allLoadedIDs]);

  return (
    <>
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
          <QueryClientProvider client={queryClient}>
            {debugVisible && <DebugWindow />}
            {/* {dataLoading && <LinearProgress />} */}
            {props.children}
          </QueryClientProvider>
        </Suspense>
      </Box>
    </>
  );
}
