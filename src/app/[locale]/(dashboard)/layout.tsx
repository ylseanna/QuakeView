"use client";

import { Box, LinearProgress, Paper } from "@mui/material";

import { ReactNode, Suspense, useEffect, useMemo, useState } from "react";

import TitleBar from "@/components/navigation/title-bar";
import NavBar from "@/components/navigation/nav-bar";
import { useKeyStroke } from "@react-hooks-library/core";
import DebugWindow from "@/components/interface/debug-window";

import {
  Query,
  QueryClient,
  QueryClientProvider,
  QueryFilters,
} from "@tanstack/react-query";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/en-gb";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { theme } from "../theme";
import BottomBar from "@/components/interface/bottom-bar";
import TimelineBar from "@/components/interface/timeline-bar";
import { usePathname } from "@/i18n/routing";
import Sidebars from "@/components/interface/sidebars";
import Toolbar from "@/components/interface/toolbar";
import Legend from "@/components/map/legend/legend";
import { queryClient } from "@/providers/query-client";
import QueryMonitor from "@/components/datasource/query-monitor";
import { useAppStateStore } from "@/providers/app-state-provider";

export default function DashboardPagesLayout(props: { children: ReactNode }) {
  const [debugVisible, setDebugVisible] = useState(false);

  const pathname = usePathname();

  useKeyStroke(["F3"], () => {
    setDebugVisible(!debugVisible);
  });

  // const queryClient = new QueryClient({
  //   defaultOptions: {
  //     queries: {
  //       // With SSR, we usually want to set some default staleTime
  //       // above 0 to avoid refetching immediately on the client
  //       staleTime: Infinity,
  //       gcTime: Infinity,
  //     },
  //   },
  // });

  const queryMonitors = useAppStateStore(
    (state) => state.appInterface.queryMonitors,
  );

  const isLoading = useMemo(
    () =>
      queryMonitors.allKeys
        .map(
          (queryMonitorKey) =>
            queryMonitors.byKey[queryMonitorKey].isLoading ||
            queryMonitors.byKey[queryMonitorKey].isFetching,
        )
        .some((el) => el),
    [queryMonitors],
  );

  return (
    <>
      <QueryMonitor />
      <TitleBar />
      <NavBar />
      <Box
        sx={{
          height: "calc(100vh - 32px - 64px)",
          display: "flex",
          flexDirection: "column",
          backgroundColor: theme.palette?.background?.default,
        }}
      >
        {isLoading && <LinearProgress />}
        <Suspense>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="en-gb"
          >
            <QueryClientProvider client={queryClient}>
              {debugVisible && <DebugWindow />}
              {props.children}

              {["/overview_map", "/3D_map"].includes(pathname) && (
                <>
                  <BottomBar />
                  <TimelineBar />
                </>
              )}
              {[
                "/overview_map",
                "/3D_map",
                "/plots/distribution_plot",
                "/plots/GR_plot",
                "/plots/stem_plot",
              ].includes(pathname) && (
                <>
                  <Legend
                    layerType={
                      pathname === "/overview_map"
                        ? "twoD"
                        : pathname === "/3D_map"
                          ? "threeD"
                          : "plot"
                    }
                  />
                  <Sidebars />
                  <Toolbar />
                </>
              )}
            </QueryClientProvider>
          </LocalizationProvider>
        </Suspense>
      </Box>
    </>
  );
}
