"use client";

// import { useTranslations } from "next-intl";
import { Grid2, Paper, SxProps, Typography } from "@mui/material";
import LegendElement from "./legend-element";
import { useTranslations } from "next-intl";
import { useProjectStore } from "@/providers/project-store-provider";

interface LegendProps {
  sx?: SxProps;
}

export default function Legend({ sx }: LegendProps) {
  const t = useTranslations("Common");

  const dataSources = useProjectStore((state) => state.dataSources);

  if (
    dataSources.allIDs!.length > 1 ||
    (dataSources.allIDs!.length == 1 &&
      dataSources.byID![dataSources.allIDs[0]].formatting.color.mapping !=
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
        <Grid2 container direction="column" spacing={2} sx={{ width: "200px" }}>
          {dataSources &&
            dataSources.allIDs.map((id) => (
              <Grid2 size="grow" key={`LegendElement-${id}`}>
                {dataSources.allIDs.length > 1 &&
                  dataSources.byID[id].formatting.color.mapping == "linear" && (
                    <Typography
                      fontSize={10}
                      fontWeight="bold"
                      sx={{
                        mb: 0.25,
                        opacity: 0.8,
                        width: "100%",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {dataSources.byID[id].filename}
                    </Typography>
                  )}

                <LegendElement dataSource={dataSources.byID[id]} />
              </Grid2>
            ))}
        </Grid2>
      </Paper>
    );
  }
}
