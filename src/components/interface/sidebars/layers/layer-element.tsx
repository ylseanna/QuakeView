"use client";

import {
  ExpandMore,
  ScatterPlot,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { Box, Checkbox, IconButton, Stack, Typography } from "@mui/material";

import { DataSource } from "@/components/custom/types";
import { SubAccordion, SubAccordionSummary } from "../../../custom/accordion";
import { TrashCan } from "mdi-material-ui";
import { useProjectStore } from "@/providers/project-store-provider";

export default function LayerElement({
  dataSource,
}: {
  dataSource: DataSource;
}) {
  const { setVisible, removeDataSource } = useProjectStore(
    (state) => state.dataSourceActions,
  );
  return (
    <SubAccordion disabled={!dataSource.interface.loadable}>
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <SubAccordionSummary
          expandIcon={null}
          aria-controls="panel1a-content"
          id="panel2a-header"
          sx={{
            flexGrow: 1,
            flexShrink: 1,
            justifyContent: "space-between",
            minWidth: 0,
          }}
          slotProps={{ content: { sx: { width: "calc(100% + 24px)" } } }}
        >
          <ScatterPlot sx={{ opacity: 0.6, mr: 1 }} />
          <Typography noWrap>{dataSource.name}</Typography>
        </SubAccordionSummary>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignSelf="center"
          spacing={1}
          sx={{ mx: 2 }}
        >
          {/* <IconButton onClick={()=>{removeDataSource(dataSource.internal_id)}} size="small" sx={{ height: "1rem", width: "1rem" }}>
            <TrashCan />
          </IconButton> */}
          <Checkbox
            checked={dataSource.interface.visible}
            icon={<VisibilityOff />}
            checkedIcon={<Visibility />}
            color="default"
            onChange={(event) => {
              setVisible(dataSource.internal_id, event.target.checked);
            }}
            sx={{ height: "1rem", width: "1rem" }}
            size="small"
          />
        </Stack>
      </Box>
    </SubAccordion>
  );
}
