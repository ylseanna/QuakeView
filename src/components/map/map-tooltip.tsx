"use client";

import { PickingInfo } from "@deck.gl/core";
// import { useTranslations } from "next-intl";
import {
  EarthQuake,
  DataSourceDataDescription,
} from "../datasource/types";
import { Grid2, Paper, SxProps, Typography } from "@mui/material";
import { useProjectStore } from "@/providers/project-store-provider";

interface MapToolTipProps {
  pickingInfo: PickingInfo<EarthQuake>;
}

const tooltipStyle: SxProps = {
  position: "absolute",
  zIndex: 1,
  pointerEvents: "none",
  p: 1,
  width: 280,
};

export default function MapToolTip({
  pickingInfo,
}: MapToolTipProps) {
  //   const t = useTranslations("Common");

  const dataSources = useProjectStore((state) => state.dataSources);

  const dataSourceID = pickingInfo.layer!.id.split("_")[1];

  const dataSource = dataSources.byID[dataSourceID]

  const { sessionInterface } = useProjectStore((state) => state);

  if (pickingInfo.object && sessionInterface.pickable) {
    return (
      <Paper
        sx={{
          ...tooltipStyle,
          left: pickingInfo.x + 8,
          top: pickingInfo.y + 8,
        }}
      >
        <Grid2 container direction="column" spacing={0.2}>
          {pickingInfo.object &&
            dataSource!.metadata.data_descr.map(
              (dataDescription: DataSourceDataDescription) =>
                ((dataDescription.required && dataDescription.variable !="t") ||
                  dataSource?.interface.addedVars.includes(
                    dataDescription.variable
                  )) && (
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
                          fontSize: "0.9em",
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
                          fontSize: "0.9em",
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
                        ) : (dataDescription.data_type == "dt_string") ? (
                          <i>{(pickingInfo.object![dataDescription.variable] as string).slice(0, -3)}</i>
                        ) : (
                          <i>{pickingInfo.object![dataDescription.variable]}</i>
                        )}{" "}
                      </Typography>
                    </Grid2>
                  </Grid2>
                )
            )}
        </Grid2>
      </Paper>
    );
  }
}
