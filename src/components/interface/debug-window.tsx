"use client";

import { Box, Paper, Typography } from "@mui/material";
import { useProjectStore } from "@/providers/project-store-provider";
import { useDataStore } from "@/providers/data-store-provider";
import { JSONTree } from "react-json-tree";
import { ScrollBarStyling } from "../layout/scrollbar-styling";

export default function DebugWindow() {
  const { sessionInterface, GPUfiltering, dataSources } = useProjectStore(
    (state) => state,
  );

  const { data } = useDataStore((state) => state);

  const theme = {
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

  return (
    <Paper
      sx={{
        ...ScrollBarStyling,
        position: "fixed",
        top: 64 + 32 + 16,
        left: 0,
        maxWidth: "calc(100vw - 64px)",
        maxHeight: "calc(100vh - 64px - 32px - 48px)",
        m: "16px",
        p: "16px",
        backgroundColor: "rgb(43, 48, 59)",
        backgroundImage: "none",
        color: "#8fa1b3",
        fontFamily: "monospace",
        zIndex: 2000,
      }}
      elevation={6}
      square
    >
      <Typography variant="inherit">-- Debug window --</Typography>

      <Typography variant="inherit" sx={{ mt: 2 }}>
        DataSources:
      </Typography>
      <JSONTree data={dataSources} theme={theme} hideRoot />

      <Typography variant="inherit" sx={{ mt: 2 }}>
        SessionInterface:
      </Typography>
      <JSONTree data={sessionInterface} theme={theme} hideRoot />

      <Typography variant="inherit" sx={{ mt: 2 }}>
        GPUfiltering:
      </Typography>
      <JSONTree data={GPUfiltering} theme={theme} hideRoot />
      <Box display="flex" flexDirection={"column"}>
        <span>Data loaded:</span>
        {Object.keys(data).map((key) => (
          <div key={key}>
            <span style={{ color: "#bf616a" }}>{key}</span>{" "}
            <span style={{ color: "#a3be8c" }}>
              [{data[key].data.length} items]
            </span>
          </div>
        ))}
      </Box>
    </Paper>
  );
}
