"use client";

import { Box, IconButton, Paper, Tooltip, useTheme } from "@mui/material";
import { useTranslations } from "next-intl";
import { ColorLens, FilterAlt, Layers } from "@mui/icons-material";
import { useRef } from "react";
import FormattingSidebar from "@/components/interface/sidebars/formatting/formatting-sidebar";
import { useClickOutside } from "@react-hooks-library/core";
import FilteringSidebar from "@/components/interface/sidebars/filtering/filtering-sidebar";
import { useAppStateStore } from "@/providers/app-state-provider";
import LayersSidebar from "@/components/interface/sidebars/layers/layers-sidebar";

export const DRAWER_WIDTH = 360;

export default function Sidebars() {
  const t = useTranslations();
  const theme = useTheme();

  // SIDEBAR STATE

  const { sidebarOpen } = useAppStateStore((state) => state.appInterface.views);

  const { setSidebarOpen } = useAppStateStore(
    (state) => state.appInterfaceActions.viewActions,
  );

  // CLICK-AWAY
  const sidebarsRef = useRef<HTMLElement | null>(null);

  useClickOutside(sidebarsRef, (evt: PointerEvent) => {
    const { target } = evt;
    if (target instanceof HTMLElement) {
      const classList = target.classList;
      if (
        classList.contains("NoClickAwayActionPanel") ||
        classList.contains("MuiColorInput-ColorSpace") ||
        classList.contains("MuiBackdrop-invisible") ||
        classList.contains("MuiButtonBase-root") ||
        classList.contains("MuiAutocomplete-listbox") ||
        classList.contains("MuiAutocomplete-option")
      ) {
        return;
      }
    }
    setSidebarOpen(null);
  });

  return (
    <Box ref={sidebarsRef}>
      <Paper
      variant="outlined"
        sx={{
          display: "flex",
          position: "fixed",
          top: 80 + 36,
          right: 0,
          width: 58,
          flexDirection: "column",
          justifyContent: "flex-end",
          transform: `translateX(-${sidebarOpen ? DRAWER_WIDTH : 0}px)`,
          mt: 2,
          p: 1,
          pr: 2,
          borderRadius: "24px 0 0 24px",
          borderRight: 0,
          zIndex: theme.zIndex.appBar - 100,
          color: "var(--theme-palette-text-primary)",
        }}
        style={{ transition: "transform.225s" }}
      >
        <Tooltip
          title={sidebarOpen == "layers" ? "" : t("Layers.layers")}
          placement="left"
        >
          <IconButton
            onClick={() => {
              if (sidebarOpen == "layers") {
                setSidebarOpen(null);
              } else {
                setSidebarOpen("layers");
              }
            }}
          >
            <Layers sx={{ color: "var(--theme-palette-text-primary)" }} />
          </IconButton>
        </Tooltip>
        <Tooltip
          title={sidebarOpen == "formatting" ? "" : t("Formatting.formatting")}
          placement="left"
        >
          <IconButton
            onClick={() => {
              if (sidebarOpen == "formatting") {
                setSidebarOpen(null);
              } else {
                setSidebarOpen("formatting");
              }
            }}
          >
            <ColorLens sx={{ color: "var(--theme-palette-text-primary)" }} />
          </IconButton>
        </Tooltip>
        <Tooltip
          title={sidebarOpen == "filtering" ? "" : t("Filtering.filtering")}
          placement="left"
        >
          <IconButton
            onClick={() => {
              if (sidebarOpen == "filtering") {
                setSidebarOpen(null);
              } else {
                setSidebarOpen("filtering");
              }
            }}
          >
            <FilterAlt sx={{ color: "var(--theme-palette-text-primary)" }} />
          </IconButton>
        </Tooltip>
      </Paper>
      <LayersSidebar />
      <FormattingSidebar />
      <FilteringSidebar />
    </Box>
  );
}
