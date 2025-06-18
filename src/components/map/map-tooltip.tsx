"use client";

import { PickingInfo } from "@deck.gl/core";
// import { useTranslations } from "next-intl";
import { EarthQuake, DataSourceDataDescription } from "../datasource/types";
import { Grid2, Paper, SxProps, Typography } from "@mui/material";
import { useProjectStore } from "@/providers/project-store-provider";
import { useMemo } from "react";

interface MapToolTipProps {
  pickingInfo: PickingInfo<EarthQuake>;
}

const TOOLTIP_WIDTH = 280;

const tooltipStyle: SxProps = {
  position: "absolute",
  zIndex: 1,
  pointerEvents: "none",
  p: 1,
  width: TOOLTIP_WIDTH,
};

export default function MapToolTip({ pickingInfo }: MapToolTipProps) {
  //   const t = useTranslations("Common");

  const dataSources = useProjectStore((state) => state.dataSources);

  const dataSourceID = pickingInfo.layer!.id.split("_")[1];

  const dataSource = dataSources.byID[dataSourceID];

  const { sessionInterface } = useProjectStore((state) => state);

  const vars_to_list = useMemo(
    () =>
      dataSource!.metadata.data_descr
        .map(
          (dataDescription: DataSourceDataDescription) =>
            ((dataDescription.required && dataDescription.variable != "t") ||
              dataSource?.interface.addedVars.includes(
                dataDescription.variable
              )) &&
            dataDescription
        )
        .filter((el) => el) as DataSourceDataDescription[],
    [dataSource]
  );

  const tooltipHeight = useMemo(
    () => vars_to_list.length * 18 + 16,
    [vars_to_list.length]
  );

  const maxX = useMemo(
    () => pickingInfo.viewport!.width - TOOLTIP_WIDTH,
    [pickingInfo.viewport]
  );

  const maxY = useMemo(
    () => pickingInfo.viewport!.height - tooltipHeight,
    [pickingInfo.viewport, tooltipHeight]
  );

  if (pickingInfo.object && sessionInterface.pickable) {
    return (
      <Paper
        sx={{
          ...tooltipStyle,
          height: tooltipHeight,
          left: pickingInfo.x < maxX ? pickingInfo.x + 8 : maxX,
          top: pickingInfo.y < maxY ? pickingInfo.y + 8 : maxY,
        }}
      >
        <Grid2 container direction="column">
          {pickingInfo.object &&
            vars_to_list.map((dataDescription: DataSourceDataDescription) => {
              return (
                <Grid2
                  key={`ToolTipVariable-${dataDescription.variable}`}
                  container
                >
                  <Grid2 size={4}>
                    <Typography
                      noWrap
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipses",
                        fontSize: "12px",
                        fontWeight: "bold",
                        opacity: 0.8,
                      }}
                    >
                      {dataDescription.alias
                        ? dataDescription.alias
                        : dataDescription.variable}
                    </Typography>
                  </Grid2>
                  <Grid2 size={"grow"}>
                    <Typography
                      noWrap
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipses",
                        fontSize: "12px",
                      }}
                    >
                      {dataDescription.data_type == "number" ? (
                        (pickingInfo.object![
                          dataDescription.variable
                        ] as number) > 0 ? (
                          <>
                            <span style={{ opacity: 0 }}>-</span>
                            <span style={{ fontFamily: "monospace" }}>
                              {pickingInfo.object![dataDescription.variable]}
                            </span>
                          </>
                        ) : (
                          <span style={{ fontFamily: "monospace" }}>
                            {pickingInfo.object![dataDescription.variable]}
                          </span>
                        )
                      ) : dataDescription.data_type == "dt_string" ? (
                        <i>
                          {(
                            pickingInfo.object![
                              dataDescription.variable
                            ] as string
                          ).slice(0, -3)}
                        </i>
                      ) : (
                        <i>{pickingInfo.object![dataDescription.variable]}</i>
                      )}{" "}
                    </Typography>
                  </Grid2>
                </Grid2>
              );
            })}
        </Grid2>
      </Paper>
    );
  }
}
