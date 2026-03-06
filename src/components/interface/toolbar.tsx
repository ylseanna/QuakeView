"use client";

// import { useTranslations } from "next-intl";
import { Checkbox, Paper, Tooltip } from "@mui/material";
import { useTranslations } from "next-intl";
import { Search } from "@mui/icons-material";
import { ChangeEvent } from "react";

import { useProjectStore } from "@/providers/project-store-provider";

export default function Toolbar() {
  const t = useTranslations();

  const { sessionInterface, interfaceActions } = useProjectStore(
    (state) => state,
  );

  return (
    <Paper
      variant="outlined"
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
      style={{ transition: "transform.225s" }}
    >
      <Tooltip title={t("Common.picking")} placement="right">
        <Checkbox
          checked={sessionInterface.pickable}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            interfaceActions.setPickable(event.target.checked);
          }}
          icon={<Search />}
          checkedIcon={<Search />}
          size="small"
          style={{borderRadius: 0}}
        />
      </Tooltip>
    </Paper>
  );
}
