/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Close, ExpandMore, ScatterPlot, Warning } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

import { useTranslations } from "next-intl";

import { useProjectStore } from "@/providers/project-store-provider";
import { useEffect } from "react";
import { DataSource } from "../types";
import { updatedMetaDataUrl } from "../data-source-query";
import ParsingForm from "./parsing-options-form";
import OtherOptionsForm from "./other-options-form";
import CatalogOverview from "./catalog-overview";

interface DataTabProps {
  id: string;
}

export const fetchUpdatedMetadata = async (dataSource: DataSource) => {
  return await fetch(updatedMetaDataUrl(dataSource)).then((res) => res.json());
};

export default function DataTab({ id }: DataTabProps) {
  const t = useTranslations();

  const dataSource = useProjectStore((state) => state.dataSources.byID[id]);
  const removeDataSource = useProjectStore(
    (state) => state.dataSourceActions.removeDataSource,
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
  };

  useEffect(() => {
    updateMetadata(dataSource);
  }, [dataSource.metadata.sep]);

  const theme = useTheme();

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
                // removeData(dataSource.internal_id);
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </Tooltip>
      </Box>
      <AccordionDetails>
        <CatalogOverview dataSource={dataSource} />
        <ParsingForm dataSource={dataSource} />
        <OtherOptionsForm dataSource={dataSource} />
      </AccordionDetails>
    </Accordion>
  );
}
