import { Visibility, VisibilityOff } from "@mui/icons-material";
import { TrashCan } from "mdi-material-ui";
import { Box, Checkbox, Divider, Drawer, IconButton, MenuItem, Select, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { ScrollBarStyling } from "@/components/layout/scrollbar-styling";
import { useProjectStore } from "@/providers/project-store-provider";
import { BOTTOMBAR_HEIGHT, DRAWER_HEIGHT } from "@/components/interface/bottom-bar";
import { useAppStateStore } from "@/providers/app-state-provider";
import LayerElement from "./layer-element";
import { usePathname } from "@/i18n/routing";

export default function LayersSidebar() {
  const t = useTranslations();
  const theme = useTheme();
  const pathname = usePathname()

  const DRAWER_WIDTH = "360px";

  const sxtextbox = {
    fontSize: "12pt",
    p: 2,
  };

  const ref = useRef(null);

  const { dataSources, sessionInterface } = useProjectStore((state) => state);

  const appInterface = useAppStateStore((state) => state.appInterface);

  const [drawerOpenDuration, setDrawerOpenDuration] = useState(225);

  useEffect(() => {
    if (appInterface.sidebarOpen) {
      setTimeout(() => setDrawerOpenDuration(0), 225);
    } else {
      setDrawerOpenDuration(225);
    }
  }, [appInterface.sidebarOpen]);

  const {
    map: { setMapStyle },
  } = useProjectStore((state) => state.interfaceActions);

  return (
    <Drawer
      ref={ref}
      anchor="right"
      variant="persistent"
      open={appInterface.sidebarOpen == "layers"}
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
            appInterface.timelineBarVisible
              ? appInterface.bottombarVisible
                ? `${DRAWER_HEIGHT + BOTTOMBAR_HEIGHT}px`
                : `${DRAWER_HEIGHT}px`
              : appInterface.bottombarVisible
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

              // <Stack
              //   key={"LayerElement-" + dataSourceID}
              //   direction="row"
              //   justifyContent="space-between"
              //   alignContent="center"
              //   sx={{ p: 2, minWidth: 0 }}
              // >
              //   <Typography
              //     noWrap
              //     sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
              //   >
              //     {dataSources.byID[dataSourceID].name}
              //   </Typography>
              //   <Stack
              //     direction="row"
              //     justifyContent="space-between"
              //     alignContent="center"
              //   >
              //     <IconButton
              //       size="small"
              //       sx={{ height: "1rem", width: "1rem" }}
              //     >
              //       <TrashCan />
              //     </IconButton>
              //     <Checkbox
              //       checked={dataSources.byID[dataSourceID].interface.visible}
              //       icon={<VisibilityOff />}
              //       checkedIcon={<Visibility />}
              //       color="default"
              //       onChange={(event) => {
              //         setVisible(dataSourceID, event.target.checked);
              //       }}
              //       sx={{ height: "1rem", width: "1rem" }}
              //       size="small"
              //     />
              //   </Stack>
              // </Stack>
            ),
        )}
      {pathname == "/overview_map" && <><Divider/>
      <Box sx={{p: 2}}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {t("Map.basemap")}
        </Typography>
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
          <MenuItem value={"WorldCountries"}>World country outlines</MenuItem>
        </Select>
      </Box></>}
      
      <Divider/>
    </Drawer>
  );
}
