"use client";

// import { useTranslations } from "next-intl";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Grid2,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataSource } from "./types";
import { useTranslations } from "next-intl";
import {
  ColorLens,
  FilterAlt,
  Layers,
  Search,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  ChangeEvent,
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import FormattingSidebar from "./formatting/formatting-sidebar";
import { useClickOutside } from "@react-hooks-library/core";
import FilteringSidebar from "./filtering/filtering-sidebar";
import Legend from "../map/legend/legend";
import BottomBar from "./GPU_filtering/bottom-bar";
import { useProjectStore } from "@/providers/project-store-provider";

interface LegendProps {
  dataSources: DataSource[];
  setDataSources: Dispatch<SetStateAction<DataSource[] | null>>;
}
export default function Actions({ dataSources, setDataSources }: LegendProps) {
  const t = useTranslations();

  const [panelPosition, setPanelPosition] = useState(0);
  const [bottombarPosition, setBottombarPosition] = useState(0);

  const DRAWER_WIDTH = 360;
  const DRAWER_HEIGHT = 200;

  const actionsRef = useRef<HTMLElement | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState<string | null>(null);
  const [bottombarOpen, setBottombarOpen] = useState<boolean>(false);

  const { sessionInterface, interfaceActions } = useProjectStore((state) => state);

  // if any sidebar open, also move panel
  useEffect(() => {
    if (sidebarOpen != null) {
      setPanelPosition(DRAWER_WIDTH);
    } else {
      setPanelPosition(0);
    }
  }, [sidebarOpen]);

  // if any sidebar open, also move panel
  useEffect(() => {
    if (bottombarOpen) {
      setBottombarPosition(DRAWER_HEIGHT);
    } else {
      setBottombarPosition(0);
    }
  }, [bottombarOpen]);

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

  const toggleBottomBar = () => {
    if (bottombarOpen) {
      setBottombarOpen(false);
    } else {
      setBottombarOpen(true);
    }
  };

  // LAYERS SIDEBAR

  // const toggleLayersSidebar = () => {
  //   if (sidebarOpen == "layers") {
  //     setSidebarOpen(null);
  //   } else {
  //     setSidebarOpen("layers");
  //   }
  // };


  // Filtering

  const setFiltering = (
    id: string,
    variableToModify: string,
    value: [number, number] | null,
  ) => {
    const indexToModify = dataSources?.findIndex(
      (dataSource) => dataSource.internal_id === id
    );

    const modifiedDataSource = dataSources[indexToModify];

    if (value) {
      modifiedDataSource.filtering = {
        ...modifiedDataSource.filtering,
        [variableToModify]: value,
      };
    } else {
      delete modifiedDataSource.filtering[variableToModify]
    }

    dataSources[indexToModify] = modifiedDataSource;

    setDataSources(dataSources);
  };

  // LAYER TAB

  const [layersVisible, setLayersVisible] = useState(false);

  const setVisible = (id: string, value: boolean) => {
    const indexToModify = dataSources?.findIndex(
      (dataSource) => dataSource.internal_id === id
    );

    const modifiedDataSource = dataSources[indexToModify];

    modifiedDataSource.interface.visible = value;

    dataSources[indexToModify] = modifiedDataSource;

    setDataSources(dataSources);
  };

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
            transform: `translateX(-${panelPosition}px)`,
            right: 0,
            m: 2,
            p: 1,
            borderRadius: "24px",
            zIndex: 9000,
            color: "var(--theme-palette-text-primary)",
          }}
          style={{ transition: "transform.225s" }}
        >
          <Tooltip title={t("Common.picking")} placement="left">
            <Checkbox
              checked={sessionInterface.pickable}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                interfaceActions.setPickable(event.target.checked);
              }}
              icon={<Search />}
              checkedIcon={<Search />}
            />
          </Tooltip>
          <Tooltip
            title={sidebarOpen == "layers" ? "" : t("Layers.layers")}
            placement="left"
          >
            <Checkbox
              checked={layersVisible}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setLayersVisible(event.target.checked);
              }}
              icon={<Layers />}
              checkedIcon={<Layers />}
            />
          </Tooltip>
          <Divider sx={{ m: 1 }} />
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
              <Grid2
                container
                direction={"column"}
                alignItems="end"
                spacing={0.5}
              >
                {dataSources &&
                  dataSources.map((dataSource) => (
                    <Grid2
                      size="grow"
                      key={dataSource.internal_id}
                      direction="row"
                      display={"flex"}
                      alignItems={"center"}
                    >
                      <Typography
                        noWrap
                        sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        {dataSource.filename}
                      </Typography>
                      <Checkbox
                        checked={dataSource.interface.visible}
                        icon={<VisibilityOff />}
                        checkedIcon={<Visibility />}
                        color="default"
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          setVisible(
                            dataSource.internal_id,
                            event.target.checked
                          );
                        }}
                        size="small"
                      />
                    </Grid2>
                  ))}
              </Grid2>
            </Paper>
          )}
        </Paper>
        <FormattingSidebar
          dataSources={dataSources}
          setDataSources={setDataSources}
          drawerOpen={sidebarOpen == "formatting"}
        />
        <FilteringSidebar
          dataSources={dataSources}
          // setDataSources={setDataSources}
          setFiltering={setFiltering}
          drawerOpen={sidebarOpen == "filtering"}
        />

        {dataSources && (
          <Legend
            dataSources={dataSources}
            sx={{
              transform: `translate(-${panelPosition}px, -${bottombarPosition}px)`,
              transition: "transform.225s",
            }}
          />
        )}
      </Box>
      {/* BOTTOM BAR */}
      <Paper
        sx={{
          position: "fixed",
          display: "flex",
          flexDirection: "column",
          transform: `translateY(-${bottombarPosition}px)`,
          transition: "transform.225s",
          alignSelf: "center",
          bottom: 0,
          p: 1,
          borderRadius: "24px 24px 0 0",
          zIndex: 1200,
          color: "var(--theme-palette-text-primary)",
        }}
      >
        <Tooltip
          title={bottombarOpen == true ? "" : t("Formatting.formatting")}
          placement="top"
        >
          <Button onClick={toggleBottomBar}>Timeline</Button>
        </Tooltip>
      </Paper>

      {dataSources && (
        <BottomBar
          dataSources={dataSources}
          setFiltering={setFiltering}
          drawerOpen={bottombarOpen}
          parentRef={actionsRef as RefObject<HTMLElement>}
        />
      )}
    </>
  );
}
