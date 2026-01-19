"use client";

import * as React from "react";
import { Container, Paper } from "@mui/material";
import GutenbergRichterPlot from "@/components/plots/gutenberg-richter-plot";

export default function Page() {
  return (
    <Container sx={{mt: 2}}>
      <Paper sx={{ p: 2 }}>
          <GutenbergRichterPlot />
      </Paper>
    </Container>
  );
}
