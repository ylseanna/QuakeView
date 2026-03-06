import { Steam } from "mdi-material-ui";
import { Drawer, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/material";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { BOTTOMBAR_HEIGHT, DRAWER_HEIGHT } from "@/components/interface/bottom-bar/bottom-bar";
import { useProjectStore } from "@/providers/project-store-provider";
import { useAppStateStore } from "@/providers/app-state-provider";
import FilteringElement from "./filtering-element";

export default function FilteringSidebar() {
  const theme = useTheme();
  const t = useTranslations("Filtering");

  const dataSources = useProjectStore((state) => state.dataSources);

  const DRAWER_WIDTH = "360px";

  const sxtextbox = {
    fontSize: "12pt",
    p: 2,
  };

  const ref = useRef(null);

  const { sidebarOpen, timelineBarVisible, bottombarVisible } = useAppStateStore((state) => state.appInterface.views );

  const [drawerOpenDuration, setDrawerOpenDuration] = useState(225);

  useEffect(() => {
    if (sidebarOpen) {
      setTimeout(() => setDrawerOpenDuration(0), 225);
    } else {
      setDrawerOpenDuration(225);
    }
  }, [sidebarOpen]);

  return (
    <>
      <Drawer
        ref={ref}
        anchor="right"
        variant="persistent"
        open={sidebarOpen == "filtering"}
        transitionDuration={drawerOpenDuration}
        sx={{
          width: DRAWER_WIDTH,

          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            zIndex: theme.zIndex.appBar - 100,
            top: "calc(80px + 32px)",
            maxHeight: `calc(100vh - 80px - 32px - ${
              timelineBarVisible
                ? bottombarVisible
                  ? `${DRAWER_HEIGHT + BOTTOMBAR_HEIGHT}px`
                  : `${DRAWER_HEIGHT}px`
                : bottombarVisible
                  ? `${BOTTOMBAR_HEIGHT}px`
                  : `0`
            })`,
          },
        }}
      >
        <Typography sx={sxtextbox}>
          <b>{t("filtering")}</b>
        </Typography>
        {!dataSources
          ? null
          : dataSources.allIDs.map((id) => (
              <FilteringElement
                key={id}
                dataSource={dataSources.byID[id]}
                single={dataSources.allIDs.length > 1 ? false : true}
              />
            ))}
      </Drawer>
    </>
  );
}
