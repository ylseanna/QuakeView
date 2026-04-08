"use client";

import * as React from "react";
import DataSelector from "@/components/data/source_selection/datasource-selector";
import DataSourceBrowser from "@/components/data/source_selection/datasource-browser";
import { Box, Container, useTheme } from "@mui/material";
import { ScrollBarStyling } from "@/components/custom/scrollbar-styling";

export default function Page() {
  const theme = useTheme();
  return (
        <DataSourceBrowser />
  );
}
