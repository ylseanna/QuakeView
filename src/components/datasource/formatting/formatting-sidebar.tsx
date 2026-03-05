import { Drawer, Typography } from "@mui/material";
import { useTheme } from "@mui/material";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { ScrollBarStyling } from "@/components/layout/scrollbar-styling";
import { useProjectStore } from "@/providers/project-store-provider";
import { BOTTOMBAR_HEIGHT, DRAWER_HEIGHT } from "@/components/interface/bottom-bar";
import { useAppStateStore } from "@/providers/app-state-provider";
import DataSourceFormattingElement from "./formatting-element";
import { useCatalogData } from "../use-data";


export default function FormattingSidebar() {
  const t = useTranslations("Formatting");
  const theme = useTheme();

  const DRAWER_WIDTH = "360px";

  const sxtextbox = {
    fontSize: "12pt",
    p: 2,
  };

  const ref = useRef(null);

  const { data } = useCatalogData();
  const dataSources = useProjectStore((state) => state.dataSources);

  const appInterface = useAppStateStore((state) => state.appInterface);

  const [drawerOpenDuration, setDrawerOpenDuration] = useState(225);

  useEffect(() => {
    if (appInterface.sidebarOpen) {
      setTimeout(() => setDrawerOpenDuration(0), 225);
    } else {
      setDrawerOpenDuration(225);
    }
  }, [appInterface.sidebarOpen]);

  return (
    <>
      <Drawer
        ref={ref}
        anchor="right"
        variant="persistent"
        open={appInterface.sidebarOpen == "formatting"}
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
          <b>{t("formatting")}</b>
        </Typography>
        {!dataSources
          ? null
          : data.allIDs.map((id) => (
              <DataSourceFormattingElement
                key={id}
                dataSource={dataSources.byID[id]}
                single={dataSources.allIDs.length > 1 ? false : true}
              />
            ))}
      </Drawer>
    </>
  );
}
