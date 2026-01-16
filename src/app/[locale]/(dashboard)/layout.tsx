/* eslint-disable @next/next/no-img-element */
"use client";

import Stack from "@mui/material/Stack";
import InfoIcon from "@mui/icons-material/Info";
import PublicIcon from "@mui/icons-material/Public";
import TableRowsIcon from "@mui/icons-material/TableRows";

import { type Navigation } from "@toolpad/core/AppProvider";

import { DashboardLayout, ThemeSwitcher } from "@toolpad/core/DashboardLayout";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { RotateOrbit } from "mdi-material-ui";
import { Box, LinearProgress } from "@mui/material";
import { Settings } from "@mui/icons-material";

import { useDataStore } from "@/providers/data-store-provider";
import { fetchData } from "@/components/datasource/load-data";
import { useProjectStore } from "@/providers/project-store-provider";
import { ReactNode, useEffect, useState } from "react";

import { isEmpty, xor } from "lodash";
import TitleBar from "@/components/navigation/title-bar";
import NavBar from "@/components/navigation/nav-bar";

function ToolbarActionsSearch() {
  return (
    <Stack direction="row">
      <ThemeSwitcher />
      <LanguageSwitcher />
    </Stack>
  );
}

export default function DashboardPagesLayout(props: { children: ReactNode }) {
  const t = useTranslations("Common");
  const locale = useLocale();

  const NAVIGATION: Navigation = [
    // {
    //   kind: "header",
    //   title: t("input"),
    // },
    {
      segment: locale,
      title: t("configure"),
      icon: <Settings />,
    },

    {
      kind: "divider",
    },
    {
      kind: "header",
      title: t("data"),
    },
    {
      segment: "overview_map",
      title: t("overview_map"),
      icon: <PublicIcon />,
    },
    {
      segment: "overview_table",
      title: t("overview_table"),
      icon: <TableRowsIcon />,
    },
    {
      kind: "header",
      title: t("visualisations"),
    },
    {
      segment: "3D_map",
      title: t("3D_map"),
      icon: <RotateOrbit />,
    },
    // {
    //   segment: "map_views",
    //   title: t("map_views"),
    //   icon: <ScatterPlotIcon />,
    // },
    // {
    //   segment: "plots",
    //   title: t("plots"),
    //   icon: <ShowChartIcon />,
    // },
    {
      kind: "divider",
    },
    {
      segment: "information",
      title: t("information"),
      icon: <InfoIcon />,
    },
  ];

  // load data (synchronized accros app)
  const { dataSources } = useProjectStore((state) => state);
  const { data, addData } = useDataStore((state) => state);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    dataSources.allIDs.forEach(async (id: string) => {
      if (data) {
        console.log(Object.keys(data));
        console.log(id);
        console.log(Object.keys(data).includes(id))
        if (!Object.keys(data).includes(id)) {
          setDataLoading(true);
          console.log(`Fetching data for ${id}`);

          await fetchData(dataSources.byID[id]).then((fetched_data) => {
            console.log(fetched_data);

            addData(id, fetched_data, dataSources.byID[id].interface.addedVars);

            setDataLoading(false);
          });
        // } else if (
        //   isEmpty(
        //     xor(data[id].addedVars, dataSources.byID[id].interface.addedVars)
        //   )
        // ) {
        //   setDataLoading(true);
        //   console.log(`Fetching data for ${id}`);

        //   await fetchData(dataSources.byID[id]).then((fetched_data) => {
        //     console.log(fetched_data);

        //     addData(id, fetched_data, dataSources.byID[id].interface.addedVars);

        //     setDataLoading(false);
        //   });
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
          height: "calc(100vh - 32px - 64px)", display: "flex", flexDirection: "column"
        }}
      >
        {dataLoading && <LinearProgress />}
        {props.children}
      </Box>
    </>
  );
}
