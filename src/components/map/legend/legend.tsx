"use client";

// import { useTranslations } from "next-intl";
import { Grid, Paper, Stack, SxProps, Typography } from "@mui/material";
import LegendElement from "./legend-element";
import { useTranslations } from "next-intl";
import { useProjectStore } from "@/providers/project-store-provider";
import { useAppStateStore } from "@/providers/app-state-provider";
import { DRAWER_WIDTH } from "@/components/interface/sidebars/sidebars";
import {
  BOTTOMBAR_HEIGHT,
  DRAWER_HEIGHT,
} from "@/components/interface/bottom-bar/bottom-bar";
import { usePathname } from "@/i18n/routing";

interface LegendProps {
  layerType: "twoD" | "threeD" | "plot";
  floating?: boolean,
}

export default function Legend({ layerType, floating = true }: LegendProps) {
  const t = useTranslations("Common");
  const pathname = usePathname();

  const dataSources = useProjectStore((state) => state.dataSources);

  const { timelineBarVisible, bottombarVisible, sidebarOpen } = useAppStateStore((state) => state.appInterface.views);


    return (
      <Paper
        variant="outlined"
        sx={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          zIndex: 100,
          bottom: 0,
          right: 0,
          m: 2,
          p: 2,

          transform: ["/overview_map", "/3D_map"].includes(pathname) ?  timelineBarVisible
            ? bottombarVisible
              ? `translate(-${sidebarOpen ? DRAWER_WIDTH : 0}px, -${DRAWER_HEIGHT + BOTTOMBAR_HEIGHT}px)`
              : `translate(-${sidebarOpen ? DRAWER_WIDTH : 0}px, -${DRAWER_HEIGHT}px)`
            : bottombarVisible
              ? `translate(-${sidebarOpen ? DRAWER_WIDTH : 0}px, -${BOTTOMBAR_HEIGHT}px)`
              : `translate(-${sidebarOpen ? DRAWER_WIDTH : 0}px, 0)` : `translate(-${sidebarOpen ? DRAWER_WIDTH : 0}px, 0)`,
          transition: "transform.225s",
        }}
      >
        <Typography fontSize={12} fontWeight="bold">
          {t("legend")}
        </Typography>
        <Stack direction="column" spacing={2} sx={{ width: "200px", mt: 1}}>
          {dataSources &&
            dataSources.allIDs.map((id) => (
              <LegendElement
                key={`LegendElement-${id}`}
                dataSource={dataSources.byID[id]}
                layerType={layerType}
              />
            ))}
        </Stack>
      </Paper>
    );
}
