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
  single = false,
}: {
  dataSource: DataSource;
  single?: boolean;
}) {
  return !single ? (
    <SubAccordion disabled={!dataSource.interface.loadable}>
      <Box sx={{ display: "flex" }}>
        <SubAccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel2a-header"
          slotProps={{ content: { sx: { width: "calc(100% - 24px)" } } }}
        >
          <ScatterPlot sx={{ opacity: 0.6, mr: 1 }} />
          <Typography noWrap>{dataSource.name}</Typography>
        </SubAccordionSummary>
      </Box>
      <SubAccordionDetails>
        {dataSource.interface.loadable && (
          <FilteringForm dataSource={dataSource} />
        )}
      </SubAccordionDetails>
    </SubAccordion>
  ) : (
    <>
      <SubAccordionDetails>
        {dataSource.interface.loadable && (
          <FilteringForm dataSource={dataSource} />
        )}
      </SubAccordionDetails>
      <Divider />
    </>
  );
}
