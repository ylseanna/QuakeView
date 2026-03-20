import { Box, Divider, Drawer, MenuItem, Select, Typography } from "@mui/material";
import { useTheme } from "@mui/material";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { BOTTOMBAR_HEIGHT, DRAWER_HEIGHT } from "@/components/interface/bottom-bar/bottom-bar";
import { ScrollBarStyling } from "@/components/custom/scrollbar-styling";
import { useProjectStore } from "@/providers/project-store-provider";
import SideDrawer from "@/components/custom/side-drawer";
import { useAppStateStore } from "@/providers/app-state-provider";
import LayerElement from "./layer-element";
import { usePathname } from "@/i18n/routing";

export default function LayersSidebar() {
  const t = useTranslations();
  const pathname = usePathname();

  const sxtextbox = {
    fontSize: "12pt",
    p: 2,
  };

  const { dataSources, sessionInterface } = useProjectStore((state) => state);

  const {
    map: { setMapStyle },
  } = useProjectStore((state) => state.interfaceActions);

  return (
    <SideDrawer type="layers">
      <Typography sx={sxtextbox}>
        <b>{t("Layers.layers")}</b>
      </Typography>
      {dataSources &&
        dataSources.allIDs.map(
          (dataSourceID) =>
            dataSources.byID[dataSourceID] && (
              <LayerElement
                key={"LayerElement-" + dataSourceID}
                dataSource={dataSources.byID[dataSourceID]}
              />
            ),
        )}
      {pathname == "/overview_map" && (
        <>
          <Divider />
          <Typography sx={sxtextbox}>
            <b>{t("Map.basemap")}</b>
          </Typography>
          <Box sx={{ p: 2, pt: 0 }}>
            <Select
              value={sessionInterface.map.mapStyle}
              fullWidth
              onChange={(event) => {
                setMapStyle(
                  event.target!.value as "Iceland" | "US" | "WorldCountries",
                );
              }}
            >
              <MenuItem value={"Iceland"}>
                DEM Iceland (Náttúrufræðistofnun)
              </MenuItem>
              <MenuItem value={"US"}>DEM United States (USGS)</MenuItem>
              <MenuItem value={"WorldCountries"}>
                World country outlines
              </MenuItem>
            </Select>
          </Box>
        </>
      )}
      <Divider />
    </SideDrawer>
  );
}
