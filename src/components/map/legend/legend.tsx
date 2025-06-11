"use client";

// import { useTranslations } from "next-intl";
import { Grid2, Paper, SxProps, Typography } from "@mui/material";
import { DataSource } from "../../datasource/types";
import LegendElement from "./legend-element";
import { useTranslations } from "next-intl";

interface LegendProps {
  dataSources: DataSource[] | null;
  sx?: SxProps;
}

export default function Legend({ dataSources, sx }: LegendProps) {
  const t = useTranslations("Common");

  if (
    dataSources!.length > 1 ||
    (dataSources!.length == 1 &&
      dataSources![0].formatting.color.mapping != "single")
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
            dataSources.map((dataSource: DataSource) => (
              <Grid2
                size="grow"
                key={`LegendElement-${dataSource.internal_id}`}
              >
                {dataSources.length > 1 &&
                  dataSource.formatting.color.mapping == "linear" && (
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
                      {dataSource.filename}
                    </Typography>
                  )}

                <LegendElement dataSource={dataSource} />
              </Grid2>
            ))}
        </Grid2>
      </Paper>
    );
  }
}
