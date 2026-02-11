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
        staleTime: Infinity,
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
        <Suspense fallback={<LinearProgress />}>
          <QueryClientProvider client={queryClient}>
            {debugVisible && <DebugWindow />}
            {props.children}
          </QueryClientProvider>
        </Suspense>
      </Box>
    </>
  );
}
