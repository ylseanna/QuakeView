"use client";

import { styled } from "@mui/material/styles";
import {
  Paper,
  Box,
  Typography,
  Tooltip,
  Badge,
  Divider,
  TextField,
  InputAdornment,
  MenuItem,
  Menu,
  Stack,
  Select,
} from "@mui/material";
import {
  DataGrid,
  Toolbar,
  ToolbarButton,
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  ExportCsv,
  ExportPrint,
  QuickFilter,
  QuickFilterControl,
  QuickFilterClear,
  QuickFilterTrigger,
  GridColDef,
  GridSearchIcon,
} from "@mui/x-data-grid";
import { useEffect, useRef, useState } from "react";
import { isIS, enUS } from "@mui/x-data-grid/locales";
import { useLocale, useTranslations } from "next-intl";
import { useData } from "@/components/datasource/use-data";
import { ScrollBarStyling } from "@/components/layout/scrollbar-styling";
import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import { useProjectStore } from "@/providers/project-store-provider";

const paginationModel = { page: 0, pageSize: 10 };

type OwnerState = {
  expanded: boolean;
};

const StyledQuickFilter = styled(QuickFilter)({
  display: "grid",
  alignItems: "center",
});

const StyledToolbarButton = styled(ToolbarButton)<{ ownerState: OwnerState }>(
  ({ theme, ownerState }) => ({
    gridArea: "1 / 1",
    width: "min-content",
    height: "min-content",
    zIndex: 1,
    opacity: ownerState.expanded ? 0 : 1,
    pointerEvents: ownerState.expanded ? "none" : "auto",
    transition: theme.transitions.create(["opacity"]),
  }),
);

const StyledTextField = styled(TextField)<{
  ownerState: OwnerState;
}>(({ theme, ownerState }) => ({
  gridArea: "1 / 1",
  overflowX: "clip",
  width: ownerState.expanded ? 260 : "var(--trigger-width)",
  opacity: ownerState.expanded ? 1 : 0,
  transition: theme.transitions.create(["width", "opacity"]),
}));

function CustomToolbar() {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuTriggerRef = useRef<HTMLButtonElement>(null);

  const { data } = useData();

  const { dataSources, sessionInterface } = useProjectStore((state) => state);
  const { setDataSourceID } = useProjectStore(
    (state) => state.interfaceActions.table,
  );
  return (
    <Toolbar>
      {dataSources.allIDs.length > 1 ? (
        <Stack direction="row" sx={{ flex: 1, minWidth: 0 }}>
          <Select
            value={sessionInterface.table.dataSourceID}
            onChange={(event) => {
              setDataSourceID(event.target!.value);
            }}
            autoWidth
          >
            {dataSources.allIDs.map((dataSourceID) => (
              <MenuItem value={dataSourceID}>
                <Stack direction="row" sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight="medium" sx={{ mx: 0.5 }} noWrap>
                    {dataSources.byID[dataSourceID].name}
                  </Typography>

                  {dataSources.byID[dataSourceID].name !=
                    dataSources.byID[dataSourceID].filename && (
                    <Typography
                      fontWeight="medium"
                      sx={{ mx: 0.5, opacity: 0.6 }}
                      noWrap
                    >
                      ({dataSources.byID[dataSourceID].filename})
                    </Typography>
                  )}
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </Stack>
      ) : (
        <Stack direction="row" sx={{ flex: 1, mx: 0.5, minWidth: 0 }}>
          <Typography fontWeight="medium" sx={{ mx: 0.5 }} noWrap>
            {dataSources.byID[sessionInterface.table.dataSourceID!].name}
          </Typography>

          {dataSources.byID[sessionInterface.table.dataSourceID!].name !=
            dataSources.byID[sessionInterface.table.dataSourceID!].filename && (
            <Typography
              fontWeight="medium"
              sx={{ mx: 0.5, opacity: 0.6 }}
              noWrap
            >
              ({dataSources.byID[sessionInterface.table.dataSourceID!].filename}
              )
            </Typography>
          )}
        </Stack>
      )}

      <Tooltip title="Columns">
        <ColumnsPanelTrigger render={<ToolbarButton />}>
          <ViewColumnIcon fontSize="small" />
        </ColumnsPanelTrigger>
      </Tooltip>

      {/* <Tooltip title="Filters">
        <FilterPanelTrigger
          render={(props, state) => (
            <ToolbarButton {...props} color="default">
              <Badge
                badgeContent={state.filterCount}
                color="primary"
                variant="dot"
              >
                <FilterListIcon fontSize="small" />
              </Badge>
            </ToolbarButton>
          )}
        />
      </Tooltip> */}

      <Divider
        orientation="vertical"
        variant="middle"
        flexItem
        sx={{ mx: 0.5 }}
      />

      <Tooltip title="Export">
        <ToolbarButton
          ref={exportMenuTriggerRef}
          id="export-menu-trigger"
          aria-controls="export-menu"
          aria-haspopup="true"
          aria-expanded={exportMenuOpen ? "true" : undefined}
          onClick={() => setExportMenuOpen(true)}
        >
          <FileDownloadIcon fontSize="small" />
        </ToolbarButton>
      </Tooltip>

      <Menu
        id="export-menu"
        anchorEl={exportMenuTriggerRef.current}
        open={exportMenuOpen}
        onClose={() => setExportMenuOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          list: {
            "aria-labelledby": "export-menu-trigger",
          },
        }}
      >
        <ExportPrint
          render={<MenuItem />}
          onClick={() => setExportMenuOpen(false)}
        >
          Print
        </ExportPrint>
        <ExportCsv
          render={<MenuItem />}
          onClick={() => setExportMenuOpen(false)}
        >
          Download as CSV
        </ExportCsv>
        {/* Available to MUI X Premium users */}
        {/* <ExportExcel render={<MenuItem />}>
          Download as Excel
        </ExportExcel> */}
      </Menu>

      <Divider
        orientation="vertical"
        variant="middle"
        flexItem
        sx={{ mx: 0.5 }}
      />

      <StyledQuickFilter>
        <QuickFilterTrigger
          render={(triggerProps, state) => (
            <Tooltip title="Search" enterDelay={0}>
              <StyledToolbarButton
                {...triggerProps}
                ownerState={{ expanded: state.expanded }}
                color="default"
                aria-disabled={state.expanded}
              >
                <GridSearchIcon fontSize="small" />
              </StyledToolbarButton>
            </Tooltip>
          )}
        />
        <QuickFilterControl
          render={({ ref, ...controlProps }, state) => (
            <StyledTextField
              {...controlProps}
              ownerState={{ expanded: state.expanded }}
              inputRef={ref}
              aria-label="Search"
              placeholder="Search..."
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: state.value ? (
                    <InputAdornment position="end">
                      <QuickFilterClear
                        edge="end"
                        size="small"
                        aria-label="Clear search"
                        material={{ sx: { marginRight: -0.75 } }}
                      >
                        <CancelIcon fontSize="small" />
                      </QuickFilterClear>
                    </InputAdornment>
                  ) : null,
                  ...controlProps.slotProps?.input,
                },
                ...controlProps.slotProps,
              }}
            />
          )}
        />
      </StyledQuickFilter>
    </Toolbar>
  );
}

export default function Page() {
  // locale and translations
  const t = useTranslations("Table");
  const locale = useLocale();

  if (locale == "is") {
    // eslint-disable-next-line no-var
    var locale_text = isIS.components.MuiDataGrid.defaultProps.localeText;
  } else {
    // eslint-disable-next-line no-var
    var locale_text = enUS.components.MuiDataGrid.defaultProps.localeText;
  }

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "Event ID",
      type: "string",
      minWidth: 150,
      flex: 1,
    },
    {
      field: "dt",
      headerName: t("time"),
      type: "string",
      minWidth: 150,
      flex: 1,
      valueFormatter: (value: string) => value.replace(" ", "T"),
      width: 90,
    },
    {
      field: "lon",
      headerName: t("lon"),
      type: "number",
      minWidth: 150,
      flex: 1,
    },
    {
      field: "lat",
      headerName: t.raw("lat"),
      type: "number",
      minWidth: 150,
      flex: 1,
    },
    {
      field: "dep",
      headerName: t("dep"),
      type: "number",
      minWidth: 150,
      flex: 1,
    },
    {
      field: "mag",
      headerName: t("mag"),
      type: "number",
      minWidth: 150,
      flex: 1,
    },
  ];
  // const [isLoading, setLoading] = useState(true);

  const { dataSources, sessionInterface } = useProjectStore((state) => state);

  const { setDataSourceID } = useProjectStore(
    (state) => state.interfaceActions.table,
  );

  const { data } = useData();

  useEffect(() => {
    if (!sessionInterface.table.dataSourceID) {
      if (data.allIDs.length > 0) {
        setDataSourceID(dataSources.allIDs[0]);
      }
    }
  }, []);

  useEffect(() => {
    if (!sessionInterface.table.dataSourceID) {
      if (data.allIDs.length > 0) {
        setDataSourceID(dataSources.allIDs[0]);
      }
    } else {
      if (data.allIDs.length == 0) {
        setDataSourceID(null);
      }
    }
  }, [sessionInterface.table.dataSourceID, data.allIDs]);

  return (
    <Box sx={{ ...ScrollBarStyling, pb: 2 }}>
      <Paper sx={{}}>
        {sessionInterface.table.dataSourceID && (
          <DataGrid
            localeText={locale_text}
            rows={
              data.allIDs.includes(sessionInterface.table.dataSourceID)
                ? data.byID[sessionInterface.table.dataSourceID].data
                : undefined
            }
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[10, 20, 50, 100]}
            sx={{ borderTop: 0 }}
            slots={{ toolbar: CustomToolbar }}
            showToolbar
          />
        )}
      </Paper>
    </Box>
  );
}
