import { Box, Paper, Slide, useTheme } from "@mui/material";

import { useAppStateStore } from "@/providers/app-state-provider";
import TimelineSlider from "../elements/timeline-slider";
import { useCatalogData } from "../../data/use-data";

export const DRAWER_HEIGHT = 200;
export const BOTTOMBAR_HEIGHT = 48;

export default function TimelineBar() {
  const { data } = useCatalogData();

  const theme = useTheme();

  const { timelineBarVisible } = useAppStateStore(
    (state) => state.appInterface.views,
  );

  return (
    <Slide
      direction="up"
      in={(timelineBarVisible && data) as boolean}
      style={{ visibility: "visible" }}
      mountOnEnter
      unmountOnExit
    >
      <Paper
        square
        sx={{
          position: "fixed",
          left: 0,
          bottom: 0,
          display: "flex",
          justifyContent: "center",
          height: DRAWER_HEIGHT,
          zIndex: 1300,
          width: "100%",
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            width: `calc(100%)`,
            height: `calc(${DRAWER_HEIGHT}px`,
          }}
        >
          <TimelineSlider />
        </Box>
      </Paper>
    </Slide>
  );
}
