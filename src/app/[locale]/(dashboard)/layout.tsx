"use client";

import * as React from "react";
import Stack from "@mui/material/Stack";
import InfoIcon from "@mui/icons-material/Info";
// import ShowChartIcon from "@mui/icons-material/ShowChart";
import InputIcon from "@mui/icons-material/Input";
// import ScatterPlotIcon from "@mui/icons-material/ScatterPlot";
import PublicIcon from "@mui/icons-material/Public";
import TableRowsIcon from "@mui/icons-material/TableRows";

import { type Navigation } from "@toolpad/core/AppProvider";

import { DashboardLayout, ThemeSwitcher } from "@toolpad/core/DashboardLayout";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { createSvgIcon } from "@mui/material";
import { RotateOrbit } from "mdi-material-ui";


function ToolbarActionsSearch() {
  return (
    <Stack direction="row">
      <ThemeSwitcher />
      <LanguageSwitcher />
    </Stack>
  );
}

const ThreeDIcon = createSvgIcon(
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <title>rotate-orbit</title>
    <path fill="var(--mui-palette-text-primary)" fillOpacity={0.8} d="M8,14.25L4.75,11H7C7.25,5.39 9.39,1 12,1C14,1 15.77,3.64 16.55,7.45C20.36,8.23 23,10 23,12C23,13.83 20.83,15.43 17.6,16.3L17.89,14.27C19.8,13.72 21,12.91 21,12C21,10.94 19.35,10 16.87,9.5C16.95,10.29 17,11.13 17,12C17,18.08 14.76,23 12,23C10.17,23 8.57,20.83 7.7,17.6L9.73,17.89C10.28,19.8 11.09,21 12,21C13.66,21 15,16.97 15,12C15,11 14.95,10.05 14.85,9.15C13.95,9.05 13,9 12,9L10.14,9.06L10.43,7.05L12,7C12.87,7 13.71,7.05 14.5,7.13C14,4.65 13.06,3 12,3C10.46,3 9.18,6.5 9,11H11.25L8,14.25M14.25,16L11,19.25V17C5.39,16.75 1,14.61 1,12C1,10.17 3.17,8.57 6.4,7.7L6.11,9.73C4.2,10.28 3,11.09 3,12C3,13.54 6.5,14.82 11,15V12.75L14.25,16Z" />
  </svg>,
  "ThreeD"
);

export default function DashboardPagesLayout(props: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Common");
  const locale = useLocale();

  const NAVIGATION: Navigation = [
    {
      kind: "header",
      title: t("input"),
    },
    {
      segment: "sources",
      title: t("sources"),
      icon: <InputIcon />,
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
      segment: locale,
      title: t("information"),
      icon: <InfoIcon />,
    },
  ];

  return (
    <DashboardLayout
      navigation={NAVIGATION}
      slots={{
        toolbarActions: ToolbarActionsSearch,
      }}
    >
      {props.children}
    </DashboardLayout>
  );
}
