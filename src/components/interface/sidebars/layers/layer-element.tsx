"use client";

import {
  ScatterPlot,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { Box, Checkbox, Stack, Typography } from "@mui/material";

import { DataSource } from "@/components/custom/types";
import { SubAccordion, SubAccordionSummary } from "../../../custom/accordion";
import { useProjectStore } from "@/providers/project-store-provider";

export default function LayerElement({
  dataSource,
}: {
  dataSource: DataSource;
}) {
  const { setVisible, removeDataSource } = useProjectStore(
    (state) => state.dataSourceActions,
  );

  const { setZoomToTarget } = useProjectStore(
    (state) => state.interfaceActions.map
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
          onClick={()=>{setZoomToTarget(dataSource.internal_id)}}
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
