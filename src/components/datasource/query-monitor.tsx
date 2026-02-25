"use client";

// import { useTranslations } from "next-intl";
import {
  Box,
  CircularProgress,
  Paper,
  Slide,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useProjectStore } from "@/providers/project-store-provider";
import { useAppStateStore } from "@/providers/app-state-provider";
import {
  BOTTOMBAR_HEIGHT,
  DRAWER_HEIGHT,
} from "@/components/interface/bottom-bar";
import { Alert, AlertCircleOutline, Check } from "mdi-material-ui";
import { usePathname } from "@/i18n/routing";
import { Cause } from "./load-data";
import { useEffect, useState } from "react";

export default function QueryMonitor() {
  const t = useTranslations("Common");

  const pathname = usePathname();

  const dataSources = useProjectStore((state) => state.dataSources);

  const appInterface = useAppStateStore((state) => state.appInterface);
  const theme = useTheme();

  const [isIn, setIsIn] = useState(false);

  useEffect(() => {
    const isActiveStatuses = appInterface.queryMonitors.allKeys
      .map(
        (queryMonitorKey) =>
          appInterface.queryMonitors.byKey[queryMonitorKey].isLoading ||
          appInterface.queryMonitors.byKey[queryMonitorKey].isFetching ||
          appInterface.queryMonitors.byKey[queryMonitorKey].error,
      )
      .some((el) => el);
    !isIn
      ? setIsIn(isActiveStatuses)
      : !isActiveStatuses &&
        setTimeout(() => {
          setIsIn(isActiveStatuses);
        }, 1500);
  }, [appInterface.queryMonitors]);

  if (dataSources.byID) {
    return (
      <Slide in={isIn} direction="up">
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
            width: "420px",
          }}
        >
          {appInterface.queryMonitors.allKeys.map(
            (queryMonitorKey) =>
              dataSources.byID[queryMonitorKey] && (
                <Stack
                  key={"QueryMonitor-" + queryMonitorKey}
                  direction="column"
                  alignItems="stretch"
                  sx={{ w: "100%" }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                      m: 2,
                      flexGrow: "1",
                      flexShrink: 0,
                      display: "inline-flex",
                    }}
                    justifyContent="space-between"
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      sx={{ minWidth: 0 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: 28,
                          mr: 1,
                        }}
                      >
                        {appInterface.queryMonitors.byKey[queryMonitorKey]
                          .isLoading ||
                        appInterface.queryMonitors.byKey[queryMonitorKey]
                          .isFetching ? (
                          <CircularProgress size={16} />
                        ) : appInterface.queryMonitors.byKey[queryMonitorKey]
                            .error ? (
                          <AlertCircleOutline
                            sx={{ mr: 1, color: theme.palette.error.main }}
                          />
                        ) : (
                          <Check
                            sx={{ mr: 1, color: theme.palette.success.main }}
                          />
                        )}
                      </Box>
                      <Typography
                        sx={{
                          color: appInterface.queryMonitors.byKey[
                            queryMonitorKey
                          ].error
                            ? theme.palette.error.main
                            : "inherit",
                        }}
                        noWrap
                      >
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
                            : appInterface.queryMonitors.byKey[queryMonitorKey]
                                  .error
                              ? t("Common.error")
                              :appInterface.queryMonitors.byKey[queryMonitorKey]
                                  .isSucces
                              ? t("Common.succes")
                              : ""}
                      </Typography>
                    </Stack>
                  </Stack>
                  {appInterface.queryMonitors.byKey[queryMonitorKey].error &&
                    (appInterface.queryMonitors.byKey[queryMonitorKey].error
                      .cause as Cause) && (
                      <Box
                        sx={{
                          p: 1,
                          display: "flex",
                          flex: "grow",
                          w: "420px",
                          backgroundColor: theme.palette.grey.A200,
                        }}
                      >
                        <Typography sx={{ opacity: 0.6, fontWeight: "bold" }}>
                          {
                            (
                              appInterface.queryMonitors.byKey[queryMonitorKey]
                                .error.cause as Cause
                            ).code
                          }
                        </Typography>
                        <Typography sx={{ opacity: 0.6, ml: 2 }}>
                          {
                            (
                              appInterface.queryMonitors.byKey[queryMonitorKey]
                                .error.cause as Cause
                            ).prototype.message
                          }
                        </Typography>
                      </Box>
                    )}
                </Stack>
              ),
          )}
        </Paper>
      </Slide>
    );
  }
}
