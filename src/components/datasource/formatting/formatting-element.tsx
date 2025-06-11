"use client";

import { ExpandMore, ScatterPlot } from "@mui/icons-material";
import { Box, Divider, Typography } from "@mui/material";
import { DataSource } from "@/components/datasource/types";
import {
  SubAccordion,
  SubAccordionDetails,
  SubAccordionSummary,
} from "../../layout/accordion";
import DataSourceFormattingForm from "./formatting-form";

export default function DataSourceFormattingElement({
  dataSource,
  setFormatting,
  single = false,
}: {
  dataSource: DataSource;
  setFormatting: CallableFunction;
  single?: boolean;
}) {
  return !single ? (
    <SubAccordion>
      <Box sx={{ display: "flex" }}>
        <SubAccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel2a-header"
          sx={{ flexGrow: 1 }}
        >
          <ScatterPlot sx={{ opacity: 0.6, mr: 1 }} />
          <Typography>{dataSource.filename}</Typography>
        </SubAccordionSummary>
      </Box>
      <SubAccordionDetails>
        <DataSourceFormattingForm
          dataSource={dataSource}
          setFormatting={setFormatting}
        />
      </SubAccordionDetails>
    </SubAccordion>
  ) : (
    <>
      <SubAccordionDetails>
        <DataSourceFormattingForm
          dataSource={dataSource}
          setFormatting={setFormatting}
        />
      </SubAccordionDetails>
      <Divider />
    </>
  );
}
