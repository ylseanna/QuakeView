"use client";

// import { useTranslations } from "next-intl";
import { Box, Checkbox, Paper, Tooltip } from "@mui/material";
import { useTranslations } from "next-intl";
import { Search } from "@mui/icons-material";
import { ChangeEvent } from "react";

import { useProjectStore } from "@/providers/project-store-provider";
import { ArrowExpandAll, MagnifyExpand } from "mdi-material-ui";

export default function Toolbar() {
  const t = useTranslations();

  const { sessionInterface, interfaceActions } = useProjectStore(
    (state) => state,
  );

  return (
    <Box
      sx={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        m: 1,
        p: 0,
        borderRadius: "8px",
        zIndex: 9000,
        color: "var(--theme-palette-text-primary)",
      }}
    >
      <Paper variant="outlined" style={{ transition: "transform.225s" }}>
        <Tooltip title={t("Common.picking")} placement="right">
          <Checkbox
            checked={sessionInterface.pickable}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              interfaceActions.setPickable(event.target.checked);
            }}
            icon={<Search />}
            checkedIcon={<Search />}
            size="small"
            style={{ borderRadius: 0 }}
          />
        </Tooltip>
      </Paper>
      <Paper
        variant="outlined"
        sx={{ mt: 1 }}
        // sx={{
        //   position: "absolute",
        //   display: "flex",
        //   flexDirection: "column",
        //   justifyContent: "flex-end",
        //   m: 1,
        //   p: 0,
        //   borderRadius: "8px",
        //   zIndex: 9000,
        //   color: "var(--theme-palette-text-primary)",
        // }}
        style={{ transition: "transform.225s" }}
      >
        <Tooltip title={t("Common.zoom_to_full_extent")} placement="right">
          <Checkbox
            checked={sessionInterface.map.showExtents}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              interfaceActions.map.setZoomToTarget("all");
            }}
            icon={<ArrowExpandAll />}
            checkedIcon={<ArrowExpandAll />}
            size="small"
            style={{ borderRadius: 0 }}
          />
        </Tooltip>
      </Paper>
    </Box>
  );
}
