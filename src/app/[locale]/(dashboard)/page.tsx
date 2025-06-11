"use client";

import * as React from "react";
import { PageContainer } from "@toolpad/core/PageContainer";
import TimelineSlider from "../../../components/d3/timeline-slider-canvas";
import {
  DataSource,
  DATASOURCE_JSON_CODEC,
} from "../../../components/datasource/types";
import { useLocalStorageState } from "@toolpad/core";
import { Box, Button, Paper } from "@mui/material";
import { useProjectStore } from "@/providers/project-store-provider";

export default function Page() {
  const [dataSources] = useLocalStorageState<DataSource[]>("data-sources", [], {
    codec: DATASOURCE_JSON_CODEC,
  });

  const { count, countActions } = useProjectStore(
    (state) => state,
  )

  return (
    <PageContainer>
      {/* <Box height={300}>
        {dataSources && <TimelineSlider dataSources={dataSources} />}
      </Box> */}
      <Paper sx={{p:2, m:2}}>
        Pickable: {count}
        <hr />
        <Button variant="outlined" onClick={countActions.incrementCount}>
          increment count
        </Button>
        <Button variant="outlined" onClick={countActions.decrementCount}>
          decrement count
        </Button>
      </Paper>
    </PageContainer>
  );
}
