"use client";

import * as React from "react";
import { Container, Paper, Typography } from "@mui/material";
import GutenbergRichterPlot from "@/components/plots/gutenberg-richter-plot";
import Sidebars from "@/components/interface/sidebars";
import Legend from "@/components/map/legend/legend";

export default function Page() {
  return (
    <>
      <Legend/>
      <Sidebars />
      <Container sx={{ mt: 2 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" sx={{mb:3}}>Gutenberg-Richter relationship</Typography>
          <GutenbergRichterPlot />
        </Paper>
      </Container>
    </>
  );
}
