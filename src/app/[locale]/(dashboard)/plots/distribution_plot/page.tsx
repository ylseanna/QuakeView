"use client";

import { Container, Paper, Box, useTheme } from "@mui/material";

import { ScrollBarStyling } from "@/components/custom/scrollbar-styling";
import MagnitudeDistributionPlot from "@/components/plots/magnitude-distribution-plot";

export default function Page() {
  const theme = useTheme()

  return (
    <Box sx={{minHeight: "100%", w: "100%", pb: 2, ...ScrollBarStyling}}>
      <Container sx={{ mt: 2, mb: 2 }}>
        <Paper sx={{ p: 4 }}>
          <MagnitudeDistributionPlot />
        </Paper>
      </Container>
    </Box>
  );
}
