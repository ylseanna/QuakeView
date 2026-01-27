"use client";

import { Paper, Container, Typography } from "@mui/material";

export default function Page() {
  return (
    <Container sx={{ pt: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Typography sx={{mb: 2}} variant="h3">Tutorial</Typography>
        <Typography>
          This is where a tutorial would live (also available in the
          documentation).
        </Typography>
      </Paper>
    </Container>
  );
}
