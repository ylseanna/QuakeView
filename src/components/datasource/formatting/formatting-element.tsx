"use client";

import { ExpandMore, ScatterPlot } from "@mui/icons-material";
import { Alert, Box, Divider, Stack, Typography } from "@mui/material";
import { DataSource } from "@/components/datasource/types";
import {
  SubAccordion,
  SubAccordionDetails,
  SubAccordionSummary,
} from "../../layout/accordion";
import { useEffect, useState } from "react";
import DataSourceFormattingForms from "./formatting-forms";

export default function DataSourceFormattingElement({
  dataSource,
  single = false,
}: {
  dataSource: DataSource;
  single?: boolean;
}) {
  const [allDomainsPresent, setAllDomainsPresent] = useState(false);

  useEffect(() => {
    const all_domains_present = ["twoD", "threeD", "plot"].map(
      (formattingType) =>
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
    ).every((el) => el);

    setAllDomainsPresent(all_domains_present);
  }, [dataSource.formatting, dataSource.metadata.variables]);

  return !single ? (
    <SubAccordion
      disabled={!dataSource.interface.loadable && allDomainsPresent}
    >
      <Box sx={{ display: "flex" }}>
        <SubAccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel2a-header"
          sx={{ flexGrow: 1 }}
        >
          <Stack direction="row" sx={{ minWidth: 0 }}>
            <ScatterPlot sx={{ opacity: 0.6, mr: 1 }} />
            <Typography noWrap>
              {dataSource.name}
            </Typography>
          </Stack>
        </SubAccordionSummary>
      </Box>
      <SubAccordionDetails>
        {dataSource.interface.loadable && allDomainsPresent && (
          <DataSourceFormattingForms dataSource={dataSource} />
        )}
      </SubAccordionDetails>
    </SubAccordion>
  ) : (
    <>
      <SubAccordionDetails sx={{ p: 0 }}>
        {dataSource.interface.loadable && allDomainsPresent ? (
          <DataSourceFormattingForms dataSource={dataSource} />
        ) : (
          <Alert sx={{ mt: 1 }} severity="error">
            Formatting broken
          </Alert>
        )}
      </SubAccordionDetails>
      <Divider />
    </>
  );
}
