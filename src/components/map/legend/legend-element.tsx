import { Box, Grid, Typography } from "@mui/material";

import CategoricalLegend from "./categorical-legend";
import { DataSource } from "../../custom/types";
// import { useTranslations } from "next-intl";
import ColormapLegend from "./colormap-legend";

interface LegendElementProps {
  dataSource: DataSource;
  layerType: "twoD" | "threeD" | "plot";
  singleColor?: boolean;
}

export default function LegendElement({
  dataSource,
  layerType,
  singleColor,
}: LegendElementProps) {
  return dataSource.formatting[layerType].color.mapping == "linear" && !singleColor ? (
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
        {dataSource.name}
      </Typography>
      <ColormapLegend dataSource={dataSource} layerType={layerType}/>
    </>
  ) : dataSource.formatting[layerType].color.mapping == "categorical" && !singleColor ? (
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
      <CategoricalLegend dataSource={dataSource} layerType={layerType}/>
    </>
  ) : (
    (dataSource.formatting[layerType].color.mapping == "single" || singleColor) && (
      <Grid container alignItems="center">
        <Grid size={2} display="flex">
          <Box
            sx={{
              display: "inline-block",
              height: "12px",
              width: "12px",
              borderRadius: "50%",
              backgroundColor: dataSource.formatting[layerType].color.single,
              opacity: dataSource.formatting[layerType].opacity,
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
            {dataSource.name}
          </Typography>
        </Grid>
      </Grid>
    )
  );
}
