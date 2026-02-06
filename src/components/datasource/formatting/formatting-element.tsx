"use client";

import { ExpandMore, ScatterPlot } from "@mui/icons-material";
import { Alert, Box, Divider, Stack, Typography } from "@mui/material";
import { DataSource } from "@/components/datasource/types";
import {
  SubAccordion,
  SubAccordionDetails,
  SubAccordionSummary,
} from "../../layout/accordion";
import DataSourceFormattingForm from "./formatting-form";
import { useEffect, useState } from "react";

export default function DataSourceFormattingElement({
  dataSource,
  setFormatting,
  single = false,
}: {
  dataSource: DataSource;
  setFormatting: CallableFunction;
  single?: boolean;
}) {
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
            <Typography noWrap textOverflow="ellipsis">{dataSource.name}</Typography>
          </Stack>
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
  ) : (
    <>
      <SubAccordionDetails>
        {dataSource.interface.loadable && allDomainsPresent ? (
          <DataSourceFormattingForm
            dataSource={dataSource}
            setFormatting={setFormatting}
          />
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
