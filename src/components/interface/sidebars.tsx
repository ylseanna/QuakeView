"use client";

// import { useTranslations } from "next-intl";
import {
  Box,
  Checkbox,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  useTheme,
} from "@mui/material";
import { useTranslations } from "next-intl";
import {
  ColorLens,
  FilterAlt,
  Layers,
} from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import FormattingSidebar from "../datasource/formatting/formatting-sidebar";
import { useClickOutside } from "@react-hooks-library/core";
import FilteringSidebar from "../datasource/filtering/filtering-sidebar";
import { useProjectStore } from "@/providers/project-store-provider";
import { useAppStateStore } from "@/providers/app-state-provider";
import LayersSidebar from "../datasource/layers/layers-sidebar";

export const DRAWER_WIDTH = 360;

export default function Sidebars() {
  const t = useTranslations();

  // GLOBAL APP STATE

  const { appInterface } = useAppStateStore((state) => state);

  // SIDEBAR STATE

  const [panelPosition, setPanelPosition] = useState(0);

  const DRAWER_WIDTH = 360;

  const actionsRef = useRef<HTMLElement | null>(null);

  // const [sidebarOpen, setSidebarOpen] = useState<string | null>(null);

  const { sidebarOpen } = useAppStateStore((state) => state.appInterface);

  const { setSidebarOpen } = useAppStateStore(
    (state) => state.appInterfaceActions,
  );

  const dataSources = useProjectStore((state) => state.dataSources);

  const setVisible = useProjectStore(
    (state) => state.dataSourceActions.setVisible,
  );

  // if any sidebar open, also move panel
  useEffect(() => {
    if (sidebarOpen != null) {
      setPanelPosition(DRAWER_WIDTH);
    } else {
      setPanelPosition(0);
    }
  }, [sidebarOpen]);

  // FORMATTING SIDEBAR

  const toggleFormattingSidebar = () => {
    if (sidebarOpen == "formatting") {
      setSidebarOpen(null);
    } else {
      setSidebarOpen("formatting");
    }
  };

  // FILTERING SIDEBAR

  const toggleFilteringSidebar = () => {
    if (sidebarOpen == "filtering") {
      setSidebarOpen(null);
    } else {
      setSidebarOpen("filtering");
    }
  };

  const [layersVisible, setLayersVisible] = useState(false);

  // CLICK-AWAY

  useClickOutside(actionsRef, (evt: PointerEvent) => {
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
    setLayersVisible(false);
  });

  const theme = useTheme();

  return (
    <Box ref={actionsRef}>
      <Paper
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
          <IconButton onClick={toggleFormattingSidebar}>
            <ColorLens sx={{ color: "var(--theme-palette-text-primary)" }} />
          </IconButton>
        </Tooltip>
        <Tooltip
          title={sidebarOpen == "filtering" ? "" : t("Filtering.filtering")}
          placement="left"
        >
          <IconButton onClick={toggleFilteringSidebar}>
            <FilterAlt sx={{ color: "var(--theme-palette-text-primary)" }} />
          </IconButton>
        </Tooltip>
      </Paper>
      <LayersSidebar />
      <FormattingSidebar />
      <FilteringSidebar
      />
    </Box>
  );
}
