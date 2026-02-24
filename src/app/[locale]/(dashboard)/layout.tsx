"use client";

import { Box, LinearProgress } from "@mui/material";

import { ReactNode, useState } from "react";

import TitleBar from "@/components/navigation/title-bar";
import NavBar from "@/components/navigation/nav-bar";
import { useKeyStroke } from "@react-hooks-library/core";
import DebugWindow from "@/components/interface/debug-window";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

  return (
    <>
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
        {queryClient.isFetching() > 0 && (
          <LinearProgress sx={{ position: "absolute" }} />
        )}
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
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
      </Box>
    </>
  );
}
