"use client";

import * as React from "react";
import { PageContainer } from "@toolpad/core";
import DataSelector from "../../../../components/datasource/source_selection/datasource-selector";
import DataSourceBrowser from "../../../../components/datasource/source_selection/datasource-browser";

export default function Page() {
  return (
    <PageContainer>
      <DataSelector></DataSelector>
      <DataSourceBrowser />
    </PageContainer>
  );
}
