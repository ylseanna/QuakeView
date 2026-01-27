import { Box, Grid, Typography } from "@mui/material";

import { DataSource } from "../../datasource/types";
import CategoricalLegend from "./categorical-legend";
// import { useTranslations } from "next-intl";
import ColormapLegend from "./colormap-legend";

interface LegendElementProps {
  dataSource: DataSource;
  singleColor?: boolean;
}

export default function LegendElement({
  dataSource,
  singleColor,
}: LegendElementProps) {
  return dataSource.formatting.color.mapping == "linear" && !singleColor ? (
    <>
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
      <ColormapLegend dataSource={dataSource} />
    </>
  ) : dataSource.formatting.color.mapping == "categorical" && !singleColor ? (
    <>
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
      <CategoricalLegend dataSource={dataSource} />
    </>
  ) : (
    (dataSource.formatting.color.mapping == "single" || singleColor) && (
      <Grid container alignItems="center">
        <Grid size={2} display="flex">
          <Box
            sx={{
              display: "inline-block",
              height: "12px",
              width: "12px",
              borderRadius: "50%",
              backgroundColor: dataSource.formatting.color.single,
              opacity: dataSource.formatting.opacity,
            }}
          ></Box>
        </Grid>
        <Grid
          size="grow"
          display="flex"
          alignItems="center"
          sx={{ h: "12px" }}
        >
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
        </Grid>
      </Grid>
    )
  );
}
