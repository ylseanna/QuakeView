"use client";

import { Edit, EditOff, Expand } from "@mui/icons-material";
import {
  Alert,
  ClickAwayListener,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Stack,
  styled,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  Box,
  Typography,
  useTheme,
} from "@mui/material";
import AlertTitle from "@mui/material/AlertTitle";

import { useFormatter, useTranslations } from "next-intl";

import { useState } from "react";
import { DataSource } from "../../custom/types";
import { useProjectStore } from "@/providers/project-store-provider";
import { useCatalogData } from "../use-data";
import { ChevronDown } from "mdi-material-ui";

interface DataTabProps {
  dataSource: DataSource;
}

function WarningEntry({
  warningTitle,
  warnings,
}: {
  warningTitle: string;
  warnings: string[];
}) {
  const [open, setOpen] = useState(true);

  return (
    <Alert key={warningTitle} severity="warning" sx={{ mb: 2, p: 2, py: 1, pb: 0}}>
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
          onClick={()=>{setOpen(!open)}}
        >
          <ChevronDown />
        </IconButton>
      </AlertTitle>
      <Collapse in={open}>
      <Box sx={{mb: 2.5}}>
        {warnings.map((warningLine, index) => (
          <Typography
            variant="rawtext"
            key={"warningKey" + index}
            sx={{ fontSize: ".9rem" }}
          >
            {warningLine}
            <br />
          </Typography>
        ))}</Box>
      </Collapse>
    </Alert>
  );
}

export default function DataSourceWarnings({ dataSource }: DataTabProps) {
  const t = useTranslations();

  const format = useFormatter();

  const autosizeOptions = {
    includeHeaders: true,
    includeOutliers: true,
    expand: true,
  };

  const { setName } = useProjectStore((state) => state.dataSourceActions);

  const [amEditingName, setAmEditingName] = useState(false);
  const [previewType, setPreviewType] = useState("parsed");

  const theme = useTheme();

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
