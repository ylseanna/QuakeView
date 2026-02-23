import { Box, Paper, Slide, useTheme } from "@mui/material";

import TimelineSlider from "../interface-elements/timeline-slider";
import { useAppStateStore } from "@/providers/app-state-provider";
import { useData } from "../datasource/use-data";

export const DRAWER_HEIGHT = 200;
export const BOTTOMBAR_HEIGHT = 48;

export default function TimelineBar() {
  const { data } = useData();

  const theme = useTheme();

  const { timelineBarVisible } = useAppStateStore(
    (state) => state.appInterface,
  );

  return (
    <Slide
      direction="up"
      in={(timelineBarVisible && data) as boolean}
      style={{ visibility: "visible" }}
      mountOnEnter
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
