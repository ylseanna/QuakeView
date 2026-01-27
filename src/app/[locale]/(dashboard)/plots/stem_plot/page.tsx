"use client";

import * as React from "react";
import { Container, Paper, Box } from "@mui/material";
import Sidebars from "@/components/interface/sidebars";
import Legend from "@/components/map/legend/legend";
import { ScrollBarStyling } from "@/components/layout/scrollbar-styling";
import StemPlot from "@/components/plots/stem-plot";

export default function Page() {
  return (
    <Box sx={{h: "100%", w: "100%", pb: 2, ...ScrollBarStyling}}>
      <Legend singleColor/>
      <Sidebars />
      <Container sx={{ mt: 2, mb: 2 }}>
        <Paper sx={{ p: 4 }}>
          <StemPlot />
        </Paper>
      </Container>
    </Box>
  );
}
