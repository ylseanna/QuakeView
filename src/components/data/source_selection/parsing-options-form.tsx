/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Grid,
  Switch,
  Divider,
} from "@mui/material";

// import {
//   DataSource,
//   DataSourceDataDescription,
//   DataSourceFormatting,
// } from "@/components/datasource/types";
import { useTranslations } from "next-intl";
// import { Dispatch, SetStateAction, useCallback } from "react";

import { SubAccordionDetails } from "../../custom/accordion";
import { useProjectStore } from "@/providers/project-store-provider";
// import { useEffect } from "react";
import DataSourceVariableForm from "../variables/variable-form";
import { DataSource } from "../../custom/types";
import { updatedMetaDataUrl } from "../data-source-query";

interface DataTabProps {
  dataSource: DataSource;
}

const sxButton = {
  padding: "4px 8px 4px 8px",
  textTransform: "capitalize",
  lineHeight: 1,
  h: 3,
};

export const fetchUpdatedMetadata = async (dataSource: DataSource) => {
  return await fetch(updatedMetaDataUrl(dataSource)).then((res) => res.json());
};

export default function ParsingForm({ dataSource }: DataTabProps) {
  const t = useTranslations();

  // // dataSourceSubactions
  // const setFormatting = useProjectStore(
  //   (state) => state.dataSourceActions.setFormatting,
  // );

  const { setIndex, setSep, setDatetimeFormat } = useProjectStore(
    (state) => state.metadataActions,
  );

  // const setMetadata = useProjectStore(
  //   (state) => state.dataSourceActions.setMetadata,
  // );
  // const updateMetadata = async (dataSource: DataSource) => {
  //   // update bounds and metadata after setting mapped variables

  //   // // fetch updated metadata
  //   // const updatedMetadata = await fetchUpdatedMetadata(dataSource);

  //   // // set metadata
  //   // setMetadata(dataSource.internal_id, updatedMetadata);

  //   // colormapBounds
  //   const colormapsBounds = Object.keys(dataSource.metadata.variables.by_id).map(
  //     (variable: string) => {
  //       const obj: { [variable: string]: [number, number] } = {};
  //       obj[variable] = dataSource.metadata.variables.by_id[variable].bounds;
  //       return obj;
  //     },
  //   );

  //   console.log(colormapsBounds);

  //   const updatedColorFormatting = {
  //     ...dataSource.formatting.color,
  //     linear: {
  //       ...dataSource.formatting.color.linear,
  //       domain: Object.assign({}, ...colormapsBounds),
  //     },
  //   };

  //   console.log(updatedColorFormatting);

  //   // updatedColorFormatting.linear.domain = ;

  //   setFormatting(
  //     dataSource.internal_id,
  //     "color",
  //     updatedColorFormatting as never,
  //   );
  // };

  // useEffect(() => {
  //   updateMetadata(dataSource);
  // }, [dataSource.metadata.sep]);

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden", mb: 2 }}>
      <Box display="flex" sx={{ m: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>
          {t("Sources.parsing_options")}
        </Typography>
      </Box>

      <SubAccordionDetails>
        <Box sx={{ px: 2 }}>
          <Grid
            container
            spacing={2}
            sx={{ alignItems: "center", minHeight: "40px" }}
          >
            <Grid size={2.5}>
              <Typography variant="formlabel">{t("Sources.index")}</Typography>
            </Grid>
            <Grid
              size="grow"
              display="flex"
              justifyContent="end"
              alignItems="center"
            >
              <Switch
                size="small"
                checked={
                  dataSource.metadata.index == "numerical" ? true : false
                }
                onChange={(event) => {
                  setIndex(
                    dataSource.internal_id,
                    event.target!.checked ? "numerical" : "from_file",
                  );
                }}
                slotProps={{ input: { "aria-label": "controlled" } }}
              />
            </Grid>
          </Grid>
          <Grid
            container
            spacing={2}
            sx={{ alignItems: "center", minHeight: "40px" }}
          >
            <Grid size={2.5}>
              <Typography variant="formlabel">
                {t("Sources.delimiter")}
              </Typography>
            </Grid>
            <Grid
              size="grow"
              display="flex"
              justifyContent="end"
              alignItems="center"
            >
              <ToggleButtonGroup
                color="primary"
                value={dataSource.metadata.sep}
                exclusive
                onChange={(event) => {
                  setSep(
                    dataSource.internal_id,
                    (event.target as HTMLInputElement).value,
                  );
                }}
                aria-label="mode"
                sx={{ height: "24px" }}
              >
                <ToggleButton value="\s+" sx={sxButton}>
                  {t("Sources.whitespace")}
                </ToggleButton>
                <ToggleButton value="," sx={sxButton}>
                  {t("Sources.comma")}
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>

          <Grid
            container
            spacing={2}
            sx={{ alignItems: "center", minHeight: "40px", mb: 2 }}
          >
            <Grid size={2.5}>
              <Typography variant="formlabel">
                {t("Sources.datetime_format")}
              </Typography>
            </Grid>
            <Grid
              size="grow"
              display="flex"
              justifyContent="end"
              alignItems="center"
            >
              <ToggleButtonGroup
                color="primary"
                value={dataSource.metadata.datetime_format}
                exclusive
                onChange={(event) => {
                  setDatetimeFormat(
                    dataSource.internal_id,
                    (event.target as HTMLInputElement).value,
                  );
                }}
                aria-label="mode"
                sx={{ height: "24px" }}
              >
                <ToggleButton value="parseable_datetime_string" sx={sxButton}>
                  {t("Sources.parseable_datetime_string")}
                </ToggleButton>
                <ToggleButton value="date_string-time_string" sx={sxButton}>
                  {t("Sources.date_string-time_string")}
                </ToggleButton>
                <ToggleButton
                  value="year-month-day-hour-minute-second"
                  sx={sxButton}
                >
                  {t("Sources.year-month-day-hour-minute-second")}
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </Box>
        <Divider sx={{ mx: 2 }} />

        <DataSourceVariableForm dataSource={dataSource} />
      </SubAccordionDetails>
    </Paper>
  );
}
