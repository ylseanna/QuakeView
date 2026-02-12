"use client";

import { Box, IconButton, Paper, Typography, useTheme } from "@mui/material";
import { useProjectStore } from "@/providers/project-store-provider";
import { JSONTree } from "react-json-tree";
import { ScrollBarStyling } from "../layout/scrollbar-styling";
import { useData } from "../datasource/use-data";
import { useAppStateStore } from "@/providers/app-state-provider";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
} from "mdi-material-ui";

export default function DebugWindow() {
  const { sessionInterface, GPUfiltering, dataSources } = useProjectStore(
    (state) => state,
  );

  const { appInterface } = useAppStateStore((state) => state);

  const { data } = useData();

  const JSONTheme = {
    scheme: "Ocean",
    author: "Chris Kempson (http://chriskempson.com)",
    base00: "#2b303b",
    base01: "#343d46",
    base02: "#4f5b66",
    base03: "#65737e",
    base04: "#a7adba",
    base05: "#c0c5ce",
    base06: "#dfe1e8",
    base07: "#eff1f5",
    base08: "#bf616a",
    base09: "#d08770",
    base0A: "#ebcb8b",
    base0B: "#a3be8c",
    base0C: "#96b5b4",
    base0D: "#8fa1b3",
    base0E: "#b48ead",
    base0F: "#ab7967",
  };

  const [position, setPosition] = useState<"left" | "right">("left");

  const theme = useTheme();

  return (
    <Paper
      sx={{
        position: "fixed",
        top: 64 + 32 + 16,
        ...(position == "left" ? { left: 0 } : { right: 0 }),
        maxWidth: "calc(0.5 * 100vw - 64px)",
        maxHeight: "calc(100vh - 64px - 32px - 48px)",
        m: "16px",
        backgroundColor: "rgb(43, 48, 59)",
        backgroundImage: "none",
        color: "#8fa1b3",
        fontFamily: "monospace",
        zIndex: 2000,
      }}
      elevation={6}
      square
    >
      <IconButton
        size="small"
        onClick={() => {
          if (position == "left") {
            setPosition("right");
          } else {
            setPosition("left");
          }
        }}
        sx={{
          color: theme.palette.text.primary,
          position: "absolute",
          ...(position == "left" ? { right: -32 } : { left: -32 }),
          borderRadius: 0,
          height: "100%",
        }}
      >
        {position == "left" ? <ChevronRight /> : <ChevronLeft />}
      </IconButton>
      <Box
        sx={{
          maxWidth: "calc(0.5 * 100vw - 64px)",
          maxHeight: "calc(100vh - 64px - 32px - 48px)",
          ...ScrollBarStyling,
          overflowX: "auto",
          p: "16px",
        }}
      >
        <Typography variant="inherit">-- Debug window --</Typography>
        <JSONTree data={appInterface} theme={JSONTheme} hideRoot />

        <Typography variant="inherit" sx={{ mt: 2 }}>
          - Global App State -
        </Typography>

        <Typography variant="inherit" sx={{ mt: 2 }}>
          - Project State -
        </Typography>

        <Typography variant="inherit">DataSources:</Typography>
        <JSONTree data={dataSources} theme={JSONTheme} hideRoot />

        <Typography variant="inherit" sx={{ mt: 2 }}>
          SessionInterface:
        </Typography>
        <JSONTree data={sessionInterface} theme={JSONTheme} hideRoot />

        <Typography variant="inherit" sx={{ mt: 2 }}>
          GPUfiltering:
        </Typography>
        <JSONTree data={GPUfiltering} theme={JSONTheme} hideRoot />
        <Box display="flex" flexDirection={"column"}>
          <span>Data loaded:</span>
          {data.allIDs.map((key) => {
            return data.byID[key] ? (
              <div key={key}>
                <span style={{ color: "#bf616a" }}>{key}</span>{" "}
                <span style={{ color: "#a3be8c" }}>
                  [{data.byID[key].data.length} items]
                </span>
                <Box sx={{ ml: 2, mt: -1 }}>
                  <JSONTree
                    data={{
                      bounds: data.byID[key].bounds,
                      extent: data.byID[key].extent,
                      filters: data.byID[key].filters,
                    }}
                    theme={JSONTheme}
                    hideRoot
                  />
                </Box>
              </div>
            ) : null;
          })}
        </Box>
      </Box>
    </Paper>
  );
}
