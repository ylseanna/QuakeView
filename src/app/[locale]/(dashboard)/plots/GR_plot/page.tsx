"use client";

import { Container, Paper, Box } from "@mui/material";
import GutenbergRichterPlot from "@/components/plots/gutenberg-richter-plot";
import { ScrollBarStyling } from "@/components/custom/scrollbar-styling";

export default function Page() {
  
  return (
    <Box
      sx={{
        h: "100%",
        w: "100%",
        pb: 2,
        ...ScrollBarStyling,
      }}
    >
      <Container sx={{ mt: 2, mb: 2 }}>
        <Paper sx={{ p: 4,}}>
          <GutenbergRichterPlot />
        </Paper>
      </Container>
    </Box>
  );
}
