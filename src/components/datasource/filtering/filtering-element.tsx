"use client";

import { ExpandMore, ScatterPlot } from "@mui/icons-material";
import { Box, Divider, Typography } from "@mui/material";

import { DataSource } from "@/components/datasource/types";
import {
  SubAccordion,
  SubAccordionDetails,
  SubAccordionSummary,
} from "../../layout/accordion";

import FilteringForm from "./filtering-form";

export default function FilteringElement({
  dataSource,
  setFiltering,
  single = false,
}: {
  dataSource: DataSource;
  setFiltering: CallableFunction;
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
        <FilteringForm dataSource={dataSource} setFiltering={setFiltering} />
      </SubAccordionDetails>
    </SubAccordion>
  ) : (
    <>
      <SubAccordionDetails>
        <FilteringForm dataSource={dataSource} setFiltering={setFiltering} />
      </SubAccordionDetails>
      <Divider />
    </>
  );
}
