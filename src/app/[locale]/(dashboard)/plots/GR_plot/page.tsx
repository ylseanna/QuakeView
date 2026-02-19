"use client";

import * as React from "react";
import { Container, Paper, Box } from "@mui/material";
import GutenbergRichterPlot from "@/components/plots/gutenberg-richter-plot";
import Sidebars from "@/components/interface/sidebars";
import Legend from "@/components/map/legend/legend";
import { ScrollBarStyling } from "@/components/layout/scrollbar-styling";

export default function Page() {
  return (
    <Box sx={{h: "100%", w: "100%", pb: 2, ...ScrollBarStyling}}>
      <Legend layerType="plot" singleColor/>
      <Sidebars />
      <Container sx={{ mt: 2, mb: 2 }}>
        <Paper sx={{ p: 4 }}>
          <GutenbergRichterPlot />
        </Paper>
      </Container>
    </Box>
  );
}
