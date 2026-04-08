"use client";

import { Container, Paper, Box, useTheme } from "@mui/material";
import GutenbergRichterPlot from "@/components/plots/gutenberg-richter-plot";
import { ScrollBarStyling } from "@/components/custom/scrollbar-styling";

export default function Page() {
  const theme = useTheme()
  return (
    <Box
      sx={{
        minHeight: "100%",
        w: "100%",
        pb: 2,
        ...ScrollBarStyling,
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container sx={{ mt: 2, mb: 2 }}>
        <Paper sx={{ p: 4 }}>
          <GutenbergRichterPlot />
        </Paper>
      </Container>
    </Box>
  );
}
