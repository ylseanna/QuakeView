import { Box, Paper, Slide, useTheme } from "@mui/material";
import { RefObject, useEffect, useState } from "react";
import TimelineSlider from "../../d3/timeline-slider-canvas";

export default function BottomBar({
  setFiltering,
  drawerOpen,
  parentRef,
}: {
  setFiltering: CallableFunction;
  drawerOpen: boolean;
  parentRef?: RefObject<HTMLElement>;
}) {
  const DRAWER_HEIGHT = 200;

  const [width, setwidth] = useState(0);

  const theme = useTheme();

  useEffect(() => {
    if (parentRef) {
      const observer = new ResizeObserver((entries) => {
        setwidth(entries[0].contentRect.width);
      });
      observer.observe(parentRef.current);

      const parentRefCurrent = parentRef.current;

      return () => parentRefCurrent && observer.unobserve(parentRefCurrent);
    }
  }, [parentRef]);

  return (
    <Slide direction="up" in={drawerOpen} style={{ visibility: "visible" }}>
      <Paper
        square
        sx={{
          position: "fixed",
          bottom: 0,
          display: "flex",
          p: 2,
          justifyContent: "center",
          height: DRAWER_HEIGHT,
          zIndex: 1300,
          width: width ? width : "",
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            width: `calc(${width}px - ${theme.spacing(2)})`,
            height: `calc(${DRAWER_HEIGHT}px - ${theme.spacing(2)})`,
          }}
        >
          <TimelineSlider />
        </Box>
      </Paper>
    </Slide>
  );
}
