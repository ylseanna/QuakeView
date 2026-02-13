"use client";

import { ColorLens, ExpandMore, FilterAlt } from "@mui/icons-material";
import { Box, Paper, Typography } from "@mui/material";

import { useTranslations } from "next-intl";

import {
  SubAccordion,
  SubAccordionDetails,
  SubAccordionSummary,
} from "../../layout/accordion";
import FilteringForm from "../filtering/filtering-form";
import { useEffect, useState } from "react";
import { DataSource } from "../types";
import { updatedMetaDataUrl } from "../data-source-query";
import DataSourceFormattingForms from "../formatting/formatting-forms";

interface DataTabProps {
  dataSource: DataSource;
}

export const fetchUpdatedMetadata = async (dataSource: DataSource) => {
  return await fetch(updatedMetaDataUrl(dataSource)).then((res) => res.json());
};

export default function OtherOptionsForm({ dataSource }: DataTabProps) {
  const t = useTranslations();

  const [allDomainsPresent, setAllDomainsPresent] = useState(false);

  useEffect(() => {
    const all_domains_present = ["twoD", "threeD", "plot"]
      .map((formattingType) =>
        dataSource.metadata.variables.required_vars
          .concat(dataSource.metadata.variables.datetime_vars)
          .concat(dataSource.metadata.variables.added_vars)
          .map((variable) => {
            console.log(variable);

            return [
              "dt",
              "id",
              "time",
              "date",
              "year",
              "month",
              "day",
              "doy",
              "hour",
              "minute",
              "second",
            ].includes(variable)
              ? true
              : dataSource.formatting[
                  formattingType as "twoD" | "threeD" | "plot"
                ].color.linear.domain[variable] != null;
          })
          .every((el) => el),
      )
      .every((el) => el);

    setAllDomainsPresent(all_domains_present);
  }, [dataSource.formatting, dataSource.metadata.variables]);
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
            <DataSourceFormattingForms dataSource={dataSource} />
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
            <FilteringForm dataSource={dataSource} />
          )}
        </SubAccordionDetails>
      </SubAccordion>
    </Paper>
  );
}
