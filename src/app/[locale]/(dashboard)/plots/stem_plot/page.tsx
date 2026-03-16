"use client";

import { Paper, Box } from "@mui/material";
import { ScrollBarStyling } from "@/components/custom/scrollbar-styling";
import StemPlot from "@/components/plots/stem-plot";
import { useAppStateStore } from "@/providers/app-state-provider";

export default function Page() {
  const { mapToolsVisible, sideBarsVisible } = useAppStateStore(
    (state) => state.appInterface.views,
  );
  return (
    <Box sx={{ h: "100%", w: "100%", pb: 2, ...ScrollBarStyling }}>
      <Box sx={{ m:2, mt: 1, maxWidth: "100%" }}>
        <Paper sx={{ p: 2, ...(mapToolsVisible ? { ml: 5 } : {}),  ...(sideBarsVisible ? { mr: 5.5 } : {}) }}>
          <StemPlot />
        </Paper>
      </Box>
    </Box>
  );
}
