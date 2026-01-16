"use client";

import * as React from "react";
import DataSelector from "@/components/datasource/source_selection/datasource-selector";
import DataSourceBrowser from "@/components/datasource/source_selection/datasource-browser";
import { Container } from "@mui/material";

export default function Page() {
  return (
    <Container sx={{pt: 2}}>
      <DataSelector />
      <DataSourceBrowser />
    </Container>
  );
}
