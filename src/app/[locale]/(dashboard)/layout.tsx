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
        staleTime: 1000,
        gcTime: Infinity,
      },
    },
  });

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
        {queryClient.isFetching() > 0 && (
          <LinearProgress sx={{ position: "absolute" }} />
        )}
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
          <QueryClientProvider client={queryClient}>
            {debugVisible && <DebugWindow />}
            {props.children}
          </QueryClientProvider>
        </LocalizationProvider>
      </Box>
    </>
  );
}
