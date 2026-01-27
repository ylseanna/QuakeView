"use client";

// import { useTranslations } from "next-intl";
import {
  Box,
  Checkbox,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import {
  ColorLens,
  FilterAlt,
  Layers,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import FormattingSidebar from "../datasource/formatting/formatting-sidebar";
import { useClickOutside } from "@react-hooks-library/core";
import FilteringSidebar from "../datasource/filtering/filtering-sidebar";
import { useProjectStore } from "@/providers/project-store-provider";

export default function Sidebars() {
  const t = useTranslations();

  const [panelPosition, setPanelPosition] = useState(0);

  const DRAWER_WIDTH = 360;

  const actionsRef = useRef<HTMLElement | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState<string | null>(null);

  const dataSources = useProjectStore((state) => state.dataSources);

  const setFormatting = useProjectStore(
    (state) => state.dataSourceActions.setFormatting,
  );
  const setFiltering = useProjectStore(
    (state) => state.dataSourceActions.setFiltering,
  );
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

  return (
    <>
      <Box ref={actionsRef}>
        <Paper
          sx={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            transform: `translateX(-${panelPosition}px)`,
            right: 0,
            mt: 2,
            p: 1,
            pr: 2,
            borderRadius: "24px 0 0 24px",
            zIndex: 9000,
            color: "var(--theme-palette-text-primary)",
          }}
          style={{ transition: "transform.225s" }}
        >
          <Tooltip
            title={sidebarOpen == "layers" ? "" : t("Layers.layers")}
            placement="left"
          >
            <Checkbox
              disabled
              checked={layersVisible}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setLayersVisible(event.target.checked);
              }}
              icon={<Layers />}
              checkedIcon={<Layers />}
            />
          </Tooltip>
          <Tooltip
            title={
              sidebarOpen == "formatting" ? "" : t("Formatting.formatting")
            }
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
          {layersVisible && (
            <Paper
              sx={{
                position: "fixed",
                right: "80px",
                p: 2,
              }}
            >
              <Grid
                container
                direction={"column"}
                alignItems="end"
                spacing={0.5}
              >
                {dataSources &&
                  dataSources.allIDs.map((id) => (
                    <Grid
                      size="grow"
                      key={id}
                      direction="row"
                      display={"flex"}
                      alignItems={"center"}
                    >
                      <Typography
                        noWrap
                        sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        {dataSources.byID[id].filename}
                      </Typography>
                      <Checkbox
                        checked={dataSources.byID[id].interface.visible}
                        icon={<VisibilityOff />}
                        checkedIcon={<Visibility />}
                        color="default"
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          setVisible(id, event.target.checked);
                        }}
                        size="small"
                      />
                    </Grid>
                  ))}
              </Grid>
            </Paper>
          )}
        </Paper>
        <FormattingSidebar
          setFormatting={setFormatting}
          drawerOpen={sidebarOpen == "formatting"}
        />
        <FilteringSidebar
          // setDataSources={setDataSources}
          setFiltering={setFiltering}
          drawerOpen={sidebarOpen == "filtering"}
        />
      </Box>
    </>
  );
}
