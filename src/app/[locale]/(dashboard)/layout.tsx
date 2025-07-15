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
import { Box, LinearProgress, Theme, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import { Settings } from "@mui/icons-material";

import { useDataStore } from "@/providers/data-store-provider";
import { fetchData } from "@/components/datasource/load-data";
import { useProjectStore } from "@/providers/project-store-provider";
import { ReactNode, useEffect, useState } from "react";

import * as _ from "lodash";

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
  const theme = useTheme() as Theme;

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
        if (!Object.keys(data).includes(id)) {
          setDataLoading(true);
          console.log(`Fetching data for ${id}`);

          await fetchData(dataSources.byID[id]).then((fetched_data) => {
            console.log(fetched_data);

            addData(id, fetched_data, dataSources.byID[id].interface.addedVars);

            setDataLoading(false);
          });
        } else if (
          !_.isEmpty(
            _.xor(data[id].addedVars, dataSources.byID[id].interface.addedVars)
          )
        ) {
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
      <Box
        className="draggableArea"
        sx={{
          height: "30px",
          width: "100%",
          display: "flex",
          borderBottom: `1px solid ${theme.palette.divider}`,
          pl: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: "10",
            fontWeight: "bold",
            color: theme.palette.primary.main,
          }}
        >
          QuakeView
        </Typography>
      </Box>
      <DashboardLayout
        navigation={NAVIGATION}
        sx={{ height: "calc(100vh - 30px)" }}
        slots={{
          toolbarActions: ToolbarActionsSearch,
        }}
      >
        {dataLoading && <LinearProgress />}
        {props.children}
      </DashboardLayout>
    </>
  );
}
