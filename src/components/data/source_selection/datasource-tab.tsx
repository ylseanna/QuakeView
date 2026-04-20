/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Close, ExpandMore, ScatterPlot, Warning } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

import { useTranslations } from "next-intl";

import { useProjectStore } from "@/providers/project-store-provider";
import { useEffect } from "react";
import { DataSource } from "../../custom/types";
import { updatedMetaDataUrl } from "../data-source-query";
import ParsingForm from "./parsing-options-form";
import OtherOptionsForm from "./other-options-form";
import CatalogOverview from "./catalog-overview";
import { TrashCan } from "mdi-material-ui";

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
  const theme = useTheme();

  return (
    <Box sx={{p: 2, mb: 2}}>
      { dataSource &&
      <><Stack direction="row" sx={{justifyContent:"space-between", mb: 2, alignItems: "center"}} >
          <Typography variant="h6" sx={{ my: 0 }}>
            {t("Sources.earthquake_catalog")}
          </Typography>
          <Tooltip title={t("Sources.remove_data_source")}>
            <Box sx={{ display: "flex", mt: 0, height: "2rem", width: "2rem"}}>
              <IconButton
                size="small"
                onClick={() => {
                  removeDataSource(dataSource.internal_id);
                  // removeData(dataSource.internal_id);
                }}
              >
                <TrashCan />
              </IconButton>
            </Box>
          </Tooltip>
        </Stack>
        <CatalogOverview dataSource={dataSource} />
        <ParsingForm dataSource={dataSource} />
        <OtherOptionsForm dataSource={dataSource} /></>}
    </Box>
  );
}
