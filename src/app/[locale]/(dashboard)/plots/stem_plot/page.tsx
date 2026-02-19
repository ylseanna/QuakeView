"use client";

import * as React from "react";
import { Paper, Box } from "@mui/material";
import Sidebars from "@/components/interface/sidebars";
import Legend from "@/components/map/legend/legend";
import { ScrollBarStyling } from "@/components/layout/scrollbar-styling";
import StemPlot from "@/components/plots/stem-plot";
import Toolbar from "@/components/interface/toolbar";

export default function Page() {
  return (
    <Box sx={{h: "100%", w: "100%", pb: 2, ...ScrollBarStyling}}>
      <Legend layerType="plot" singleColor/>
      <Sidebars />
      <Toolbar/>
      <Box  sx={{ m: 2, maxWidth: "100%" }}>
        <Paper sx={{ p: 2 }}>
          <StemPlot />
        </Paper>
      </Box>
    </Box>
  );
}
