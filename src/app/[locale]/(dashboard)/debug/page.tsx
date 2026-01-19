"use client";

import { Button, Divider, Paper, Box, Container } from "@mui/material";
import { useProjectStore } from "@/providers/project-store-provider";
import { useDataStore } from "@/providers/data-store-provider";
// import { useDataStore } from "@/providers/data-store-provider";
// import { useEffect, useState } from "react";
// import { fetchData } from "@/components/datasource/load-data";
// import * as _ from "lodash";

export default function Page() {
  const { count, countActions } = useProjectStore((state) => state);

  const { dataSources } = useProjectStore((state) => state);

  // // load data (synchronized accros app)
  const { data } = useDataStore((state) => state);

  return (
    <Container sx={{pt: 2}}>
      {/* <Box height={300}>
        {dataSources && <TimelineSlider dataSources={dataSources} />}
      </Box> */}
      <Box
        display="flex"
        flexDirection={"column"}
        sx={{ position: "absolute", bottom: 0, left: 0 }}
      >
        <span>DataSources:</span>
        {Object.keys(dataSources.byID).map((key) => (
          <span key={key}>{key}</span>
        ))}
        <span>Data:</span>
        {Object.keys(data).map((key) => (
          <span key={key}>{key}</span>
        ))}
      </Box>
      <Paper sx={{ p: 2}}>
        Count: {count}
        <Divider sx={{ mt: 2, mb: 2 }} />
        <Button variant="outlined" onClick={countActions.incrementCount}>
          increment count
        </Button>
        <Button variant="outlined" onClick={countActions.decrementCount}>
          decrement count
        </Button>
      </Paper>
    </Container>
  );
}
