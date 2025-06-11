import { Box, Grid2, Typography } from "@mui/material";
import { DataSource } from "../../datasource/types";
// import { useTranslations } from "next-intl";
import ColormapLegend from "./colormap-legend";

interface LegendElementProps {
  dataSource: DataSource;
}

export default function LegendElement({ dataSource }: LegendElementProps) {
  return dataSource.formatting.color.mapping == "linear" ? (
    <ColormapLegend dataSource={dataSource} />
  ) : (
    dataSource.formatting.color.mapping == "single" && (
      <Grid2 container alignItems="center">
        <Grid2 size={2} display="flex">
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
        </Grid2>
        <Grid2 size="grow" display="flex" alignItems="center" sx={{h: "12px"}}>
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
        </Grid2>
      </Grid2>
    )
  );
}
