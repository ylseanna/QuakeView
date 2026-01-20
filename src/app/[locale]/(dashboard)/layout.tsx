"use client";

import { Box, LinearProgress } from "@mui/material";

import { useDataStore } from "@/providers/data-store-provider";
import { fetchData } from "@/components/datasource/load-data";
import { useProjectStore } from "@/providers/project-store-provider";
import { ReactNode, Suspense, useEffect, useState } from "react";

// import { isEmpty, xor } from "lodash";
import TitleBar from "@/components/navigation/title-bar";
import NavBar from "@/components/navigation/nav-bar";
import { useKeyStroke } from "@react-hooks-library/core";
import { useRouter } from "@/i18n/routing";

export default function DashboardPagesLayout(props: { children: ReactNode }) {
  // load data (synchronized accros app)
  const { dataSources } = useProjectStore((state) => state);
  const { data, addData } = useDataStore((state) => state);
  const [dataLoading, setDataLoading] = useState(false);

  const router = useRouter()

  useKeyStroke(["F3"], ()=>{
    router.push('/debug')
  })

  useEffect(() => {
    dataSources.allIDs.forEach(async (id: string) => {
      if (data) {
        console.log(Object.keys(data));
        console.log(id);
        console.log(Object.keys(data).includes(id));
        if (!Object.keys(data).includes(id)) {
          setDataLoading(true);
          console.log(`Fetching data for ${id}`);

          await fetchData(dataSources.byID[id]).then((fetched_data) => {
            console.log(fetched_data);

            addData(id, fetched_data, dataSources.byID[id].interface.addedVars);

            setDataLoading(false);
          });
        }
      }
    });
  }, [data, addData, dataSources]);

  return (
    <>
      <TitleBar />
      <NavBar />
      <Box
        sx={{
          height: "calc(100vh - 32px - 64px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Suspense fallback={<LinearProgress />}>
          {dataLoading && <LinearProgress />}
          {props.children}
        </Suspense>
      </Box>
    </>
  );
}
