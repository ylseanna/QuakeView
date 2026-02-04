/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  ColorLens,
  ExpandMore,
  FilterAlt,
} from "@mui/icons-material";
import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

// import {
//   DataSource,
//   DataSourceDataDescription,
//   DataSourceFormatting,
// } from "@/components/datasource/types";
import { useTranslations } from "next-intl";
// import { Dispatch, SetStateAction, useCallback } from "react";
import DataSourceFormattingForm from "../formatting/formatting-form";

import {
  SubAccordion,
  SubAccordionDetails,
  SubAccordionSummary,
} from "../../layout/accordion";
import FilteringForm from "../filtering/filtering-form";
import { useProjectStore } from "@/providers/project-store-provider";
import { useEffect, useState } from "react";
import { DataSource } from "../types";
import { updatedMetaDataUrl } from "../data-source-query";

interface DataTabProps {
  dataSource: DataSource;
}

export const fetchUpdatedMetadata = async (dataSource: DataSource) => {
  return await fetch(updatedMetaDataUrl(dataSource)).then((res) => res.json());
};

export default function OtherOptionsForm({ dataSource }: DataTabProps) {
  const t = useTranslations();


  // dataSourceSubactions
  const setFormatting = useProjectStore(
    (state) => state.dataSourceActions.setFormatting,
  );
  const setFiltering = useProjectStore(
    (state) => state.dataSourceActions.setFiltering,
  );

  const setMetadata = useProjectStore(
    (state) => state.dataSourceActions.setMetadata,
  );

  const updateMetadata = async (dataSource: DataSource) => {
    // update bounds and metadata after setting mapped variables

    // fetch updated metadata
    const updatedMetadata = await fetchUpdatedMetadata(dataSource);

    // set metadata
    setMetadata(dataSource.internal_id, updatedMetadata);

    // colormapBounds
    const colormapsBounds = Object.keys(updatedMetadata.variables.by_id).map(
      (variable: string) => {
        const obj: { [variable: string]: [number, number] } = {};
        obj[variable] = updatedMetadata.variables.by_id[variable].bounds;
        return obj;
      },
    );

    console.log(colormapsBounds);

    const updatedColorFormatting = {
      ...dataSource.formatting.color,
      linear: {
        ...dataSource.formatting.color.linear,
        domain: Object.assign({}, ...colormapsBounds),
      },
    };

    console.log(updatedColorFormatting);

    // updatedColorFormatting.linear.domain = ;

    setFormatting(
      dataSource.internal_id,
      "color",
      updatedColorFormatting as never,
    );
  };

  useEffect(()=>{
    updateMetadata(dataSource)
  }, [dataSource.metadata.sep])

  const [allDomainsPresent, setAllDomainsPresent] = useState(false);

  useEffect(() => {
    const all_domains_present = dataSource.metadata.variables.required_vars
      .concat(dataSource.metadata.variables.added_vars)
      .map((variable) => {
        if (
          Object.keys(dataSource.formatting.color.linear.domain).includes(
            variable,
          )
        ) {
          return variable == "dt" || variable == "id"
            ? true
            : dataSource.formatting.color.linear.domain[variable] != null;
        } else {
          return false;
        }
      });

    console.log(all_domains_present);

    setAllDomainsPresent(all_domains_present.every((el) => el));
  }, [
    dataSource.formatting.color.linear.domain,
    dataSource.metadata.variables,
  ]);

  return (
        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
          <Box display="flex" sx={{ m: 2 }}>
            <Typography sx={{ fontWeight: "bold" }}>
              {t("Sources.other_options")}
            </Typography>
          </Box>

          <SubAccordion
            sx={{ borderBottom: "0px!important" }}
            disabled={!(dataSource.interface.loadable && allDomainsPresent)}
          >
            <Box sx={{ display: "flex" }}>
              <SubAccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel1a-content"
                id="panel2a-header"
                sx={{ flexGrow: 1 }}
              >
                <ColorLens sx={{ opacity: 0.6, mr: 1, ml: -0.5 }} />
                <Typography>{t("Formatting.formatting")}</Typography>
              </SubAccordionSummary>
            </Box>
            <SubAccordionDetails>
              {dataSource.interface.loadable && allDomainsPresent && (
                <DataSourceFormattingForm
                  dataSource={dataSource}
                  setFormatting={setFormatting}
                />
              )}
            </SubAccordionDetails>
          </SubAccordion>

          <SubAccordion
            sx={{ borderBottom: "0px!important" }}
            disabled={!dataSource.interface.loadable}
          >
            <Box sx={{ display: "flex" }}>
              <SubAccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel1a-content"
                id="panel2a-header"
                sx={{ flexGrow: 1 }}
              >
                <FilterAlt sx={{ opacity: 0.6, mr: 1, ml: -0.5 }} />
                <Typography>{t("Filtering.filtering")}</Typography>
              </SubAccordionSummary>
            </Box>
            <SubAccordionDetails>
              {dataSource.interface.loadable && (
                <FilteringForm
                  dataSource={dataSource}
                  setFiltering={setFiltering}
                />
              )}
            </SubAccordionDetails>
          </SubAccordion>
        </Paper>
  );
}
