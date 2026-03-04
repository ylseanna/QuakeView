"use client";

// import { useTranslations } from "next-intl";
import {
  Box,
  CircularProgress,
  Collapse,
  IconButton,
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
import {
  AlertCircleOutline,
  Check,
  ChevronDown,
  ChevronUp,
} from "mdi-material-ui";
import { usePathname } from "@/i18n/routing";
import { Cause } from "./load-data";
import { useEffect, useState } from "react";
import { type QueryMonitor } from "@/stores/app-state";
import * as Humanize from "humanize-plus";

function MultiChunkQueryElement({
  singleDataSourceQueryMonitor,
  filename,
  numEvents,
}: {
  singleDataSourceQueryMonitor: {
    [index: string]: QueryMonitor;
  };
  filename: string;
  numEvents: number;
}) {
  const t = useTranslations("Common");
  const theme = useTheme();

  const [listOpen, setListOpen] = useState(true);

  const { queryKeys } = useAppStateStore((state) => state.appInterface);

  const queryMonitorKey = singleDataSourceQueryMonitor["0"].dataSourceID;

  const anyChunksLoading = Object.keys(singleDataSourceQueryMonitor)
    .map(
      (queryKeyIndex) =>
        singleDataSourceQueryMonitor[queryKeyIndex].isLoading ||
        singleDataSourceQueryMonitor[queryKeyIndex].isFetching,
    )
    .some((el) => el);

  const anyChunksError = Object.keys(singleDataSourceQueryMonitor)
    .map((queryKeyIndex) => singleDataSourceQueryMonitor[queryKeyIndex].error)
    .some((el) => el);

  const allChunksSucces = Object.keys(singleDataSourceQueryMonitor)
    .map(
      (queryKeyIndex) => singleDataSourceQueryMonitor[queryKeyIndex].isSucces,
    )
    .every((el) => el);

  useEffect(() => {
    if (allChunksSucces) {
      setListOpen(false);
    }
  }, [allChunksSucces]);

  const numChunksSucces = Object.keys(singleDataSourceQueryMonitor)
    .map(
      (queryKeyIndex) => singleDataSourceQueryMonitor[queryKeyIndex].isSucces,
    )
    .reduce((accumulator, el) => (el ? accumulator + 1 : accumulator), 0);

  return (
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
        <Stack direction="row" alignItems="center" sx={{ minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: 28,
              mr: 1,
            }}
          >
            {anyChunksLoading ? (
              <CircularProgress size={16} />
            ) : anyChunksError ? (
              <AlertCircleOutline
                sx={{ mr: 1, color: theme.palette.error.main }}
              />
            ) : (
              <Check sx={{ mr: 1, color: theme.palette.success.main }} />
            )}
          </Box>
          <Typography
            sx={{
              color: anyChunksError ? theme.palette.error.main : "inherit",
            }}
            noWrap
          >
            {filename}
          </Typography>{" "}
        </Stack>
        <Stack direction="row" alignItems="center">
          <Typography sx={{ opacity: 0.6, ml: 1, mr: 1 }}>
            {numChunksSucces +
              "/" +
              Object.keys(singleDataSourceQueryMonitor).length}
          </Typography>
          <IconButton
            size="small"
            onClick={() => {
              setListOpen(!listOpen);
            }}
          >
            {listOpen ? <ChevronUp /> : <ChevronDown />}
          </IconButton>
        </Stack>
      </Stack>
      <Collapse in={listOpen}>
        <Stack
          direction="column"
          alignItems="stretch"
          sx={{ w: "100%", py: 1, backgroundColor: theme.palette.grey.A200 }}
        >
          {Object.keys(singleDataSourceQueryMonitor).map((queryKeyIndex) => {
            const queryMonitor = singleDataSourceQueryMonitor[queryKeyIndex];

            const queryKey = queryKeys.filter(
              (key) =>
                key[1] == queryMonitor.dataSourceID &&
                String(key[2]) == queryKeyIndex,
            )[0];

            return (
              <Stack
                key={queryMonitorKey + "-chunk-" + queryKeyIndex}
                direction="row"
                alignItems="center"
                sx={{
                  py: 1,
                  pl: 1,
                  pr: 2,
                  flexGrow: "1",
                  flexShrink: 0,
                  display: "inline-flex",
                }}
                justifyContent="space-between"
              >
                <Stack direction="row" alignItems="center" sx={{ minWidth: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: 28,
                      mr: 2,
                      ml: 1,
                    }}
                  >
                    {queryMonitor.isLoading || queryMonitor.isFetching ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : queryMonitor.error ? (
                      <AlertCircleOutline sx={{ mr: 1, height: 16 }} />
                    ) : (
                      <Check sx={{ mr: 1, height: 16, ml: "-3px" }} />
                    )}
                  </Box>
                  <Typography
                    className="shimmer"
                    sx={{
                      opacity: 0.8,
                      color: anyChunksError
                        ? theme.palette.error.main
                        : "inherit",
                      fontSize: 13,
                      ml: -1,
                    }}
                    noWrap
                  >
                    {t("Common.chunk_size_range", {
                      start: Humanize.compactInteger(queryKey[4][0] + 1, 1),
                      end: Humanize.compactInteger(
                        queryKey[4][1] != -1 ? queryKey[4][1] : numEvents,
                        queryKey[4][1] != -1 ? 1 : 3,
                      ),
                    })}
                  </Typography>{" "}
                </Stack>
                <Stack direction="row" alignItems="center">
                  <Typography sx={{ opacity: 0.6, ml: 1, mr: 1, fontSize: 13 }}>
                    {queryMonitor.isLoading
                      ? t("Common.loading")
                      : queryMonitor.isFetching
                        ? t("Common.fetching")
                        : queryMonitor.error
                          ? t("Common.error")
                          : queryMonitor.isSucces
                            ? t("Common.loaded")
                            : ""}
                  </Typography>
                </Stack>
                {queryMonitor.error && (queryMonitor.error.cause as Cause) && (
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
                      {(queryMonitor.error.cause as Cause).code}
                    </Typography>
                    <Typography sx={{ opacity: 0.6, ml: 2 }}>
                      {(queryMonitor.error.cause as Cause).prototype.message}
                    </Typography>
                    <Typography
                      sx={{
                        opacity: 1,
                        ml: 2,
                        color: theme.palette.error.main,
                      }}
                    >
                      {t("Common.please_restart")}
                    </Typography>
                  </Box>
                )}
              </Stack>
            );
          })}
        </Stack>
      </Collapse>
    </Stack>
  );
}

export default function QueryMonitor() {
  const t = useTranslations("Common");

  const pathname = usePathname();

  const dataSources = useProjectStore((state) => state.dataSources);

  const { queryMonitors, timelineBarVisible, bottombarVisible } =
    useAppStateStore((state) => state.appInterface);
  const theme = useTheme();

  const [isIn, setIsIn] = useState(false);

  useEffect(() => {
    const isActiveStatuses = queryMonitors.allKeys
      .map(
        (queryMonitorKey) =>
          queryMonitors.byKey[queryMonitorKey] &&
          Object.keys(queryMonitors.byKey[queryMonitorKey])
            .map(
              (queryKeyIndex) =>
                queryMonitors.byKey[queryMonitorKey][queryKeyIndex].isLoading ||
                queryMonitors.byKey[queryMonitorKey][queryKeyIndex].isFetching,
            )
            .some((el) => el),
      )
      .some((el) => el);
    !isIn
      ? setIsIn(isActiveStatuses)
      : !isActiveStatuses &&
        setTimeout(() => {
          setIsIn(isActiveStatuses);
        }, 1500);
  }, [queryMonitors]);

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
              ? `${(timelineBarVisible ? DRAWER_HEIGHT : 0) + (bottombarVisible ? BOTTOMBAR_HEIGHT : 0)}px`
              : 0,
            left: 0,
            m: 2,
            width: "420px",
          }}
        >
          {queryMonitors.allKeys.map((queryMonitorKey) => {
            if (dataSources.byID[queryMonitorKey]) {
              if (
                !(Object.keys(queryMonitors.byKey[queryMonitorKey]).length > 1)
              ) {
                const queryMonitor = queryMonitors.byKey[queryMonitorKey]["0"];

                console.log(queryMonitor);

                return (
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
                          {queryMonitor.isLoading || queryMonitor.isFetching ? (
                            <CircularProgress size={16} />
                          ) : queryMonitor.error ? (
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
                            color: queryMonitor.error
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
                          {queryMonitors.byKey[queryMonitorKey].isLoading
                            ? t("Common.loading")
                            : queryMonitors.byKey[queryMonitorKey].isFetching
                              ? t("Common.fetching")
                              : queryMonitors.byKey[queryMonitorKey].error
                                ? t("Common.error")
                                : queryMonitors.byKey[queryMonitorKey].isSucces
                                  ? t("Common.succes")
                                  : ""}
                        </Typography>
                      </Stack>
                    </Stack>
                    {queryMonitor.error &&
                      (queryMonitor.error.cause as Cause) && (
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
                            {(queryMonitor.error.cause as Cause).code}
                          </Typography>
                          <Typography sx={{ opacity: 0.6, ml: 2 }}>
                            {
                              (queryMonitor.error.cause as Cause).prototype
                                .message
                            }
                          </Typography>
                          <Typography
                            sx={{
                              opacity: 1,
                              ml: 2,
                              color: theme.palette.error.main,
                            }}
                          >
                            {t("Common.please_restart")}
                          </Typography>
                        </Box>
                      )}
                  </Stack>
                );
              } else {
                return (
                  <MultiChunkQueryElement
                    key={"QueryMonitorMulti-" + queryMonitorKey}
                    singleDataSourceQueryMonitor={
                      queryMonitors.byKey[queryMonitorKey]
                    }
                    filename={dataSources.byID[queryMonitorKey].filename}
                    numEvents={
                      dataSources.byID[queryMonitorKey].metadata.num_events
                    }
                  />
                );
              }
            }
          })}
        </Paper>
      </Slide>
    );
  }
}
