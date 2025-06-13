"use client";

import {
  Close,
  ColorLens,
  ExpandMore,
  Numbers,
  ScatterPlot,
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

interface DataTabProps {
  id: string;
}

export default function DataTab({
  id
}: DataTabProps) {
  const t = useTranslations();

  const dataSource = useProjectStore((state) => state.dataSources.byID[id]);
  const removeDataSource = useProjectStore((state) => state.dataSourceActions.removeDataSource);
  const { removeData } = useDataStore((state) => state);

  // dataSourceSubactions
  const setFormatting = useProjectStore((state) => state.dataSourceActions.setFormatting);
  const setFiltering = useProjectStore((state) => state.dataSourceActions.setFiltering);
  const setVariableDescr = useProjectStore((state) => state.dataSourceActions.setVariableDescr);
  const setAddedVars = useProjectStore((state) => state.dataSourceActions.setAddedVars);


  // const setFormatting = (
  //   id: string,
  //   keyToModify: keyof DataSourceFormatting,
  //   value: never
  // ) => {
  //   const indexToModify = dataSources?.findIndex(
  //     (dataSource) => dataSource.internal_id === id
  //   ) as number;

  //   const modifiedDataSource = dataSources![indexToModify];

  //   modifiedDataSource.formatting[keyToModify] = value;

  //   dataSources![indexToModify] = modifiedDataSource;

  //   setDataSources(dataSources);
  // };

  // const setFiltering = (
  //   id: string,
  //   variableToModify: string,
  //   value: [number, number] | null,
  // ) => {
  //   const indexToModify = dataSources?.findIndex(
  //     (dataSource) => dataSource.internal_id === id
  //   );

  //   const modifiedDataSource = dataSources[indexToModify];

  //   if (value) {
  //     modifiedDataSource.filtering = {
  //       ...modifiedDataSource.filtering,
  //       [variableToModify]: value,
  //     };
  //   } else {
  //     delete modifiedDataSource.filtering[variableToModify]
  //   }

  //   dataSources[indexToModify] = modifiedDataSource;

  //   setDataSources(dataSources);
  // };

  // const setVariableDescr = (
  //   id: string,
  //   variableToModify: string,
  //   keyToModify: keyof DataSourceDataDescription,
  //   value: never
  // ) => {
  //   const indexToModify = dataSources?.findIndex(
  //     (dataSource) => dataSource.internal_id === id
  //   ) as number;

  //   const modifiedDataSource = dataSources![indexToModify];

  //   const modifiedVariableObject = modifiedDataSource.metadata.data_descr.find(
  //     (dataDescription: DataSourceDataDescription) =>
  //       dataDescription.variable == variableToModify
  //   );

  //   modifiedVariableObject![keyToModify] = value;

  //   dataSources![indexToModify] = modifiedDataSource;

  //   setDataSources(dataSources);
  // };

  // const setAddedVars = (id: string, value: string[]) => {
  //   const indexToModify = dataSources?.findIndex(
  //     (dataSource) => dataSource.internal_id === id
  //   ) as number;

  //   const modifiedDataSource = dataSources![indexToModify];

  //   modifiedDataSource.interface.addedVars = value;

  //   dataSources![indexToModify] = modifiedDataSource;

  //   setDataSources(dataSources);
  // };

  return (
    <Accordion>
      <Box sx={{ display: "flex" }}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel2a-header"
          sx={{ flexGrow: 1 }}
        >
          <ScatterPlot sx={{ opacity: 0.6, mr: 1 }} />
          <Typography>{dataSource.filename}</Typography>
        </AccordionSummary>
        <Tooltip title={t("Sources.remove_data_source")}>
          <Box sx={{ display: "flex", p: 1, pl: 0 }}>
            <IconButton
              size="small"
              onClick={() => {removeDataSource(dataSource.internal_id); removeData(dataSource.internal_id)}}
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
              <Grid2  size={6}>
                <Typography>{dataSource.filename}</Typography>
              </Grid2>
              <Grid2 size={2}>
                <Typography noWrap>
                  <b>{t("Sources.filepath")}:</b>
                </Typography>
              </Grid2>
              <Grid2  size={6}>
                <Typography>{dataSource.filepath}</Typography>
              </Grid2>
              <Grid2 size={2}>
                <Typography noWrap>
                  <b>{t("Sources.num_events")}:</b>
                </Typography>
              </Grid2>
              <Grid2  size={6}>
                <Typography>{String(dataSource.metadata.num_events)}</Typography>
              </Grid2>
              <Grid2 size={2}>
                <Typography noWrap>
                  <b>{t("Sources.column_headers")}:</b>
                </Typography>
              </Grid2>
              <Grid2 size={6}>
                <Typography>{dataSource.metadata.data_headers.join(", ")}</Typography>
              </Grid2>
          </Grid2>
        </Paper>

        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
          <Box display="flex" sx={{ m: 2 }}>
            <Typography sx={{ fontWeight: "bold" }}>{t("Sources.options")}</Typography>
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
              <DataSourceVariableForm
                dataSource={dataSource}
                setVariableDescr={setVariableDescr}
                setAddedVars={setAddedVars}
              />
            </SubAccordionDetails>
          </SubAccordion>
          <SubAccordion sx={{ borderBottom: "0px!important" }}>
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
              <DataSourceFormattingForm
                dataSource={dataSource}
                setFormatting={setFormatting}
              />
            </SubAccordionDetails>
          </SubAccordion>
          <SubAccordion sx={{ borderBottom: "0px!important" }}>
            <Box sx={{ display: "flex" }}>
              <SubAccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel1a-content"
                id="panel2a-header"
                sx={{ flexGrow: 1 }}
              >
                <ColorLens sx={{ opacity: 0.6, mr: 1, ml: -0.5 }} />
                <Typography>{t("Filtering.filtering")}</Typography>
              </SubAccordionSummary>
            </Box>
            <SubAccordionDetails>
              <FilteringForm
                dataSource={dataSource}
                setFiltering={setFiltering}
              />
            </SubAccordionDetails>
          </SubAccordion>
        </Paper>
      </AccordionDetails>
    </Accordion>
  );
}
