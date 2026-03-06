"use client";

import * as React from "react";
import { Container, Paper, Typography, Box } from "@mui/material";
import GutenbergRichterPlot from "@/components/plots/gutenberg-richter-plot";
import Sidebars from "@/components/interface/sidebars/sidebars";
import Legend from "@/components/map/legend/legend";
import MagnitudeDistributionPlot from "@/components/plots/magnitude-distribution-plot";
import { ScrollBarStyling } from "@/components/custom/scrollbar-styling";

export default function Page() {
  return (
    <Box sx={{h: "100%", w: "100%", ...ScrollBarStyling}}>
      <Legend layerType="plot"/>
      <Sidebars />
      <Container sx={{ mt: 2, mb: 2, pb: 2}}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" sx={{mb:3}}>Gutenberg-Richter relationship</Typography>
          <GutenbergRichterPlot />
        </Paper>
        <Paper sx={{ p: 4, mt: 2}}>
          <Typography variant="h4" sx={{mb:3}}>Magnitude Distribution</Typography>
          <MagnitudeDistributionPlot />
        </Paper>
      </Container>
    </Box>
  );
}
