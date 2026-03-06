"use client";

import * as React from "react";
import DataSelector from "@/components/data/source_selection/datasource-selector";
import DataSourceBrowser from "@/components/data/source_selection/datasource-browser";
import { Box, Container, useTheme } from "@mui/material";
import { ScrollBarStyling } from "@/components/custom/scrollbar-styling";

export default function Page() {
  return (
    <Box sx={{ h: "100%", w: "100%", pb: 2, ...ScrollBarStyling }}>
      <Container sx={{ pt: 2, pb: 4 }}>
        <DataSelector />
        <DataSourceBrowser />
      </Container>
    </Box>
  );
}
