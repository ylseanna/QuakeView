"use client";

import { Alert, Collapse, IconButton, Box, Typography } from "@mui/material";
import AlertTitle from "@mui/material/AlertTitle";

import { useState } from "react";
import { useCatalogData } from "../use-data";
import { ChevronDown } from "mdi-material-ui";
import { DataSource } from "@/components/custom/types";

function WarningEntry({
  warningTitle,
  warnings,
}: {
  warningTitle: string;
  warnings: string[];
}) {
  const [open, setOpen] = useState(true);

  return (
    <Alert
      key={warningTitle}
      severity="warning"
      sx={{ mb: 2, p: 2, py: 1, pb: 0 }}
    >
      <AlertTitle sx={{ mt: "-2px", width: "100%" }}>
        {warningTitle}
        <IconButton
          sx={{
            fontSize: "1rem",
            width: "1.8rem",
            height: "1.8rem",
            margin: ".1rem",
            ml: 1,
            transform: open ? "rotate(-180deg)" : "rotate(0)",
            transitionDuration: "150ms",
            transitionProperty: "transform",
          }}
          onClick={() => {
            setOpen(!open);
          }}
        >
          <ChevronDown />
        </IconButton>
      </AlertTitle>
      <Collapse in={open}>
        <Box sx={{ mb: 2.5 }}>
          {warnings.map((warningLine, index) => (
            <Typography
              variant="rawtext"
              key={"warningKey" + index}
              sx={{ fontSize: ".9rem" }}
            >
              {warningLine}
              <br />
            </Typography>
          ))}
        </Box>
      </Collapse>
    </Alert>
  );
}

export default function DataSourceWarnings({
  dataSource,
}: {
  dataSource: DataSource;
}) {
  const { data } = useCatalogData();

  if (data.byID[dataSource.internal_id]) {
    if (data.byID[dataSource.internal_id].warnings) {
      return (
        <>
          {Object.keys(data.byID[dataSource.internal_id].warnings).map(
            (warningTitle) => (
              <WarningEntry
                warningTitle={warningTitle}
                warnings={
                  data.byID[dataSource.internal_id].warnings[warningTitle]
                }
              />
            ),
          )}
        </>
      );
    }
  }
}
