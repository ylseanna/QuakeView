import { Box, Divider, Drawer, MenuItem, Select, Typography } from "@mui/material";
import { useTheme } from "@mui/material";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { BOTTOMBAR_HEIGHT, DRAWER_HEIGHT } from "@/components/interface/bottom-bar/bottom-bar";
import { ScrollBarStyling } from "@/components/custom/scrollbar-styling";
import { useProjectStore } from "@/providers/project-store-provider";
import { useAppStateStore } from "@/providers/app-state-provider";
import LayerElement from "./layer-element";
import { usePathname } from "@/i18n/routing";

export default function LayersSidebar() {
  const t = useTranslations();
  const theme = useTheme();
  const pathname = usePathname();

  const DRAWER_WIDTH = "360px";

  const sxtextbox = {
    fontSize: "12pt",
    p: 2,
  };

  const ref = useRef(null);

  const { dataSources, sessionInterface } = useProjectStore((state) => state);

  const views = useAppStateStore((state) => state.appInterface.views);

  const [drawerOpenDuration, setDrawerOpenDuration] = useState(225);

  useEffect(() => {
    if (views.sidebarOpen) {
      setTimeout(() => setDrawerOpenDuration(0), 225);
    } else {
      setDrawerOpenDuration(225);
    }
  }, [views.sidebarOpen]);

  const {
    map: { setMapStyle },
  } = useProjectStore((state) => state.interfaceActions);

  return (
    <Drawer
      ref={ref}
      anchor="right"
      variant="persistent"
      open={views.sidebarOpen == "layers"}
      transitionDuration={drawerOpenDuration}
      sx={{
        width: DRAWER_WIDTH,

        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          zIndex: theme.zIndex.appBar - 100,
          overflowX: "hidden",
          ...ScrollBarStyling,
          top: "calc(80px + 32px)",
          maxHeight: `calc(100vh - 80px - 32px - ${
            views.timelineBarVisible
              ? views.bottombarVisible
                ? `${DRAWER_HEIGHT + BOTTOMBAR_HEIGHT}px`
                : `${DRAWER_HEIGHT}px`
              : views.bottombarVisible
                ? `${BOTTOMBAR_HEIGHT}px`
                : `0`
          })`,
        },
      }}
    >
      {/* <Box sx={{ display: "box", height: "calc(80px + 32px)" }} /> */}
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
    </Drawer>
  );
}
