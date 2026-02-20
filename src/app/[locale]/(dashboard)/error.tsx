"use client"; // Error boundaries must be Client Components

import { Button, Box, Typography } from "@mui/material";
import { Alert } from "mdi-material-ui";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <Box
      sx={{
        display: "flex",
        height: "calc(100vh - 80px - 32px)",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Alert sx={{fontSize: 42, mb: 2}}/>
      <Typography variant="h4" sx={{opacity: .8}}>
        Something was a little shakey there...
      </Typography>
      {error.digest && (
        <Typography sx={{ fontFamily: "monospace" }}>{error.digest}</Typography>
      )}
      <Button
      sx={{mt:2}}
        variant="outlined"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Reset page
      </Button>
    </Box>
  );
}
