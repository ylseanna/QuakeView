"use client";

import {
  Close,
  ColorLens,
  Edit,
  EditOff,
  ExpandMore,
  FilterAlt,
  Folder,
  // Numbers,
  ScatterPlot,
  Warning,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  ClickAwayListener,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  Grid,
} from "@mui/material";

// import {
//   DataSource,
//   DataSourceDataDescription,
//   DataSourceFormatting,
// } from "@/components/datasource/types";
import { useFormatter, useTranslations } from "next-intl";
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
  const format = useFormatter();

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
  const [amEditingName, setAmEditingName] = useState(false);

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
            <Warning sx={{ mr: 1, color: theme.palette.warning.main }} />
          )}
          <Typography
            sx={
              dataSource.interface.loadable
                ? {}
                : { color: theme.palette.warning.main }
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
        <Paper variant="outlined" sx={{ mb: 2, pt: 1, pb: 1 }}>
          <Stack
            sx={{
              ".full-row": {
                ml: 2,
                mr: 2,
                flexDirection: "row",
                justifyContent: "space-between",
                ".first-bit": {
                  minHeight: "36px",
                  alignItems: "center",
                  ".row-header": {
                    minWidth: "200px",
                  },
                },
              },
            }}
          >
            <Stack className="full-row">
              <Typography variant="h6" sx={{ my: 1 }}>
                {t("Sources.earthquake_catalog")}
              </Typography>
            </Stack>
            <ClickAwayListener
              onClickAway={() => {
                setAmEditingName(false);
              }}
            >
              <Stack className="full-row">
                <Stack className="first-bit" direction="row">
                  <Typography className="row-header" noWrap>
                    <b>{t("Sources.name")}:</b>
                  </Typography>

                  {dataSource.name != dataSource.filename || amEditingName ? (
                    <TextField
                      sx={{ marginBottom: "-4px" }}
                      size="small"
                      variant="standard"
                      value={dataSource.name}
                      fullWidth
                    />
                  ) : (
                    <Typography
                      onClick={() => {
                        setAmEditingName(true);
                      }}
                    >
                      {dataSource.name}
                    </Typography>
                  )}
                </Stack>
                <IconButton
                  onClick={() => {
                    setAmEditingName(!amEditingName);
                  }}
                >
                  {amEditingName ? <EditOff /> : <Edit />}
                </IconButton>
              </Stack>
            </ClickAwayListener>
            <Stack className="full-row">
              <Stack className="first-bit" direction="row">
                <Typography className="row-header" noWrap>
                  <b>{t("Sources.filepath")}:</b>
                </Typography>
                <Typography>{dataSource.filepath}</Typography>
              </Stack>
              <IconButton>
                <Folder />
              </IconButton>
            </Stack>
            <Stack className="full-row" direction="row">
              <Stack className="first-bit" direction="row">
                <Typography className="row-header" noWrap>
                  <b>{t("Sources.num_events")}:</b>
                </Typography>
                <Typography>
                  {format.number(dataSource.metadata.num_events)}
                </Typography>
              </Stack>
            </Stack>
            <Divider sx={{ my: 1, mx: 2 }} />
            <Stack className="full-row" direction="row">
              <Stack className="first-bit" direction="row">
                <Typography className="row-header" noWrap>
                  <b>{t("Sources.column_headers")}:</b>
                </Typography>
              </Stack>
            </Stack>
            <Grid
              container
              sx={{
                display: "flex",
                width: "100%",
                m: 2,
                "--Grid-borderWidth": "1px",
                borderTop: "var(--Grid-borderWidth) solid",
                borderLeft: "var(--Grid-borderWidth) solid",
                borderColor: "divider",
                "& > div": {
                  p: 1,
                  borderRight: "var(--Grid-borderWidth) solid",
                  borderBottom: "var(--Grid-borderWidth) solid",
                  borderColor: "divider",
                },
              }}
            >
              {dataSource.metadata.catalog_headers.map((header, index) => (
                <Grid key={index} size="auto">
                  {header}
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
          <Box display="flex" sx={{ m: 2 }}>
            <Typography sx={{ fontWeight: "bold" }}>
              {t("Sources.options")}
            </Typography>
          </Box>
          {/* <SubAccordion
            slotProps={{
              root: {
                sx: {
                  outline: !dataSource.interface.loadable
                    ? `1px solid ${theme.palette.error.main}`
                    : "0",
                  borderLeft: !dataSource.interface.loadable
                    ? `1px solid ${theme.palette.error.main}`
                    : "0",
                  borderRight: !dataSource.interface.loadable
                    ? `1px solid ${theme.palette.error.main}`
                    : "0",
                },
              },
            }}
          >
            <Box sx={{ display: "flex" }}>
              <SubAccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel1a-content"
                id="panel2a-header"
                sx={{
                  flexGrow: 1,
                }}
              >
                <Numbers
                  sx={{
                    opacity: 0.6,
                    mr: 1,
                    ml: -0.5,
                  }}
                />
                <Typography>{t("Variables.variables")}</Typography>
              </SubAccordionSummary>
            </Box>*/}
          <SubAccordionDetails>
            <Typography sx={{ fontWeight: "bold" }}>
              {t("Sources.variable_mapping")}
            </Typography>
            <DataSourceVariableForm dataSource={dataSource} />
          </SubAccordionDetails>
          {/*  </SubAccordion> */}

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
