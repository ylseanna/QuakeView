"use client";

// import { useTranslations } from "next-intl";
import { Grid, Paper, SxProps, Typography } from "@mui/material";
import LegendElement from "./legend-element";
import { useTranslations } from "next-intl";
import { useProjectStore } from "@/providers/project-store-provider";

interface LegendProps {
  layerType: "twoD" | "threeD" | "plot";
  singleColor?: boolean;
  sx?: SxProps;
}

export default function Legend({ layerType, singleColor, sx }: LegendProps) {
  const t = useTranslations("Common");

  const dataSources = useProjectStore((state) => state.dataSources);

  if (
    dataSources.allIDs!.length > 1 ||
    (dataSources.allIDs!.length == 1 &&
      dataSources.byID![dataSources.allIDs[0]].formatting[layerType].color.mapping !=
        "single")
  ) {
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

          ...sx,
        }}
      >
        <Typography sx={{ mb: 1 }} fontSize={12} fontWeight="bold">
          {t("legend")}
        </Typography>
        <Grid container direction="column" spacing={2} sx={{ width: "200px" }}>
          {dataSources &&
            dataSources.allIDs.map((id) => (
              <Grid size="grow" key={`LegendElement-${id}`}>
                {/* {dataSources.allIDs.length > 1 &&
                  (dataSources.byID[id].formatting.color.mapping == "linear" ||
                    dataSources.byID[id].formatting.color.mapping ==
                      "categorical") &&
                  !singleColor && (
                  )} */}

                <LegendElement
                  dataSource={dataSources.byID[id]}
                  layerType={layerType}
                  singleColor={singleColor}
                />
              </Grid>
            ))}
        </Grid>
      </Paper>
    );
  }
}
