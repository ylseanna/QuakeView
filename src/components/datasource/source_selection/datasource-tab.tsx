"use client";

import {
  Close,
  ColorLens,
  ExpandMore,
  FilterAlt,
  Numbers,
  ScatterPlot,
  Warning,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid2,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

// import {
//   DataSource,
//   DataSourceDataDescription,
//   DataSourceFormatting,
// } from "@/components/datasource/types";
import { useTranslations } from "next-intl";
// import { Dispatch, SetStateAction, useCallback } from "react";
import DataSourceFormattingForm from "../formatting/formatting-form";

import DataSourceVariableForm from "../variables/variable-form";
import {
  SubAccordion,
  SubAccordionDetails,
  SubAccordionSummary,
} from "../../layout/accordion";
import FilteringForm from "../filtering/filtering-form";
import { useProjectStore } from "@/providers/project-store-provider";
import { useDataStore } from "@/providers/data-store-provider";
import { useEffect, useState } from "react";

interface DataTabProps {
  id: string;
}

export default function DataTab({ id }: DataTabProps) {
  const t = useTranslations();

  const dataSource = useProjectStore((state) => state.dataSources.byID[id]);
  const removeDataSource = useProjectStore(
    (state) => state.dataSourceActions.removeDataSource,
  );
  const { removeData } = useDataStore((state) => state);

  // dataSourceSubactions
  const setFormatting = useProjectStore(
    (state) => state.dataSourceActions.setFormatting,
  );
  const setFiltering = useProjectStore(
    (state) => state.dataSourceActions.setFiltering,
  );
  const theme = useTheme();

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
    <Accordion>
      <Box sx={{ display: "flex" }}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel2a-header"
          sx={{ flexGrow: 1 }}
        >
          {dataSource.interface.loadable ? (
            <ScatterPlot sx={{ opacity: 0.6, mr: 1 }} />
          ) : (
            <Warning sx={{ mr: 1, color: theme.palette.error.main }} />
          )}
          <Typography
            sx={
              dataSource.interface.loadable
                ? {}
                : { color: theme.palette.error.main }
            }
          >
            {dataSource.filename}
          </Typography>
        </AccordionSummary>
        <Tooltip title={t("Sources.remove_data_source")}>
          <Box sx={{ display: "flex", p: 1, pl: 0 }}>
            <IconButton
              size="small"
              onClick={() => {
                removeDataSource(dataSource.internal_id);
                removeData(dataSource.internal_id);
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </Tooltip>
      </Box>
      <AccordionDetails>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Grid2 container columns={8}>
            <Grid2 size={2}>
              <Typography noWrap>
                <b>{t("Sources.filename")}:</b>
              </Typography>
            </Grid2>
            <Grid2 size={6}>
              <Typography>{dataSource.filename}</Typography>
            </Grid2>
            <Grid2 size={2}>
              <Typography noWrap>
                <b>{t("Sources.filepath")}:</b>
              </Typography>
            </Grid2>
            <Grid2 size={6}>
              <Typography>{dataSource.filepath}</Typography>
            </Grid2>
            <Grid2 size={2}>
              <Typography noWrap>
                <b>{t("Sources.num_events")}:</b>
              </Typography>
            </Grid2>
            <Grid2 size={6}>
              <Typography>{String(dataSource.metadata.num_events)}</Typography>
            </Grid2>
            <Grid2 size={2}>
              <Typography noWrap>
                <b>{t("Sources.column_headers")}:</b>
              </Typography>
            </Grid2>
            <Grid2 size={6}>
              <Typography>
                {dataSource.metadata.catalog_headers.join(", ")}
              </Typography>
            </Grid2>
          </Grid2>
        </Paper>

        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
          <Box display="flex" sx={{ m: 2 }}>
            <Typography sx={{ fontWeight: "bold" }}>
              {t("Sources.options")}
            </Typography>
          </Box>
          <SubAccordion>
            <Box sx={{ display: "flex" }}>
              <SubAccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel1a-content"
                id="panel2a-header"
                sx={{ flexGrow: 1 }}
              >
                <Numbers sx={{ opacity: 0.6, mr: 1, ml: -0.5 }} />
                <Typography>{t("Variables.variables")}</Typography>
              </SubAccordionSummary>
            </Box>
            <SubAccordionDetails>
              <DataSourceVariableForm dataSource={dataSource} />
            </SubAccordionDetails>
          </SubAccordion>

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
      </AccordionDetails>
    </Accordion>
  );
}
