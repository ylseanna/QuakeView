"use client";

import { PageContainer } from "@toolpad/core";
import { Button, Divider, Paper, Box, LinearProgress } from "@mui/material";
import { useProjectStore } from "@/providers/project-store-provider";
import { useDataStore } from "@/providers/data-store-provider";
import { useEffect, useState } from "react";
import { fetchData } from "@/components/datasource/load-data";
import * as _ from "lodash";

export default function Page() {
  const { count, countActions } = useProjectStore((state) => state);

  const { dataSources } = useProjectStore((state) => state);

  // load data (synchronized accros app)
  const { data, addData } = useDataStore((state) => state);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    dataSources.allIDs.forEach(async (id: string) => {
      if (!Object.keys(data).includes(id)) {
        setDataLoading(true);

        const fetched_data = await fetchData(dataSources.byID[id]);
        console.log(fetched_data);

        addData(id, fetched_data, dataSources.byID[id].interface.addedVars);

        setDataLoading(false);
      } else if (
        !_.isEmpty(
          _.xor(data[id].addedVars, dataSources.byID[id].interface.addedVars)
        )
      ) {
        console.log();

        let fetched_data = [];

        fetched_data = await fetchData(dataSources.byID[id]);

        setDataLoading(true);

        console.log(fetched_data);

        addData(id, fetched_data, dataSources.byID[id].interface.addedVars);

        setDataLoading(false);
      }
    });
  }, [data, addData, dataSources, dataLoading]);

  return (
    <PageContainer sx={{ position: "relative" }}>
      {dataLoading && <LinearProgress />}
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
      <Paper sx={{ p: 2, m: 2 }}>
        Count: {count}
        <Divider sx={{ mt: 2, mb: 2 }} />
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
