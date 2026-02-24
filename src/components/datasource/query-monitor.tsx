"use client";

// import { useTranslations } from "next-intl";
import {
  Box,
  CircularProgress,
  Paper,
  Slide,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useProjectStore } from "@/providers/project-store-provider";
import { useAppStateStore } from "@/providers/app-state-provider";
import {
  BOTTOMBAR_HEIGHT,
  DRAWER_HEIGHT,
} from "@/components/interface/bottom-bar";
import { Check } from "mdi-material-ui";
import { usePathname } from "@/i18n/routing";

export default function QueryMonitor() {
  const t = useTranslations("Common");

  const pathname = usePathname();

  const dataSources = useProjectStore((state) => state.dataSources);

  const appInterface = useAppStateStore((state) => state.appInterface);

  if (dataSources.byID) {
    return (
      <Slide
        in={appInterface.queryMonitors.allKeys
          .map(
            (queryMonitorKey) =>
              appInterface.queryMonitors.byKey[queryMonitorKey].isLoading ||
              appInterface.queryMonitors.byKey[queryMonitorKey].isFetching,
          )
          .some((el) => el)}
        direction="up"
      >
        <Paper
          variant="outlined"
          sx={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            zIndex: 100,
            bottom: ["/overview_map", "/3D_map"].includes(pathname)
              ? `${(appInterface.timelineBarVisible ? DRAWER_HEIGHT : 0) + (appInterface.bottombarVisible ? BOTTOMBAR_HEIGHT : 0)}px`
              : 0,
            left: 0,
            m: 2,
            p: 2,
            pb: 1,
            width: "420px",
          }}
        >
          {appInterface.queryMonitors.allKeys.map(
            (queryMonitorKey) =>
              dataSources.byID[queryMonitorKey] && (
                <Stack
                  key={"QueryMonitor-" + queryMonitorKey}
                  direction="row"
                  alignItems="center"
                  sx={{ mb: 1, w: "100%" }}
                  justifyContent="space-between"
                >
                  <Stack direction="row" alignItems="center">
                    <Box sx={{display: "flex", alignItems: "center", width: 28, mr: 1 }}>
                      {appInterface.queryMonitors.byKey[queryMonitorKey]
                        .isLoading ||
                      appInterface.queryMonitors.byKey[queryMonitorKey]
                        .isFetching ? (
                        <CircularProgress size={16}/>
                      ) : (
                        <Check sx={{ mr: 1 }} />
                      )}
                    </Box>
                    <Typography>
                      {dataSources.byID[queryMonitorKey].filename}
                    </Typography>{" "}
                  </Stack>
                  <Stack direction="row" alignItems="center">
                    <Typography sx={{ opacity: 0.6, ml: 1 }}>
                      {appInterface.queryMonitors.byKey[queryMonitorKey]
                        .isLoading
                        ? t("Common.loading")
                        : appInterface.queryMonitors.byKey[queryMonitorKey]
                              .isFetching
                          ? t("Common.fetching")
                          : ""}
                    </Typography>
                  </Stack>
                </Stack>
              ),
          )}
        </Paper>
      </Slide>
    );
  }
}
