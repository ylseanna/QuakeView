/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Edit, EditOff } from "@mui/icons-material";
import {
  ClickAwayListener,
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
  Typography,
  useTheme,
} from "@mui/material";

// import {
//   DataSource,
//   DataSourceDataDescription,
//   DataSourceFormatting,
// } from "@/components/datasource/types";
import { useFormatter, useTranslations } from "next-intl";
// import { Dispatch, SetStateAction, useCallback } from "react";

import { useProjectStore } from "@/providers/project-store-provider";
import { useEffect, useState } from "react";
import { DataSource } from "../types";
import { updatedMetaDataUrl } from "../data-source-query";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import { Folder } from "mdi-material-ui";
import { useGridApiRef } from "@mui/x-data-grid/hooks/utils/useGridApiRef";

interface DataTabProps {
  dataSource: DataSource;
}

export const fetchUpdatedMetadata = async (dataSource: DataSource) => {
  return await fetch(updatedMetaDataUrl(dataSource)).then((res) => res.json());
};

const sxButton = {
  padding: "4px 8px 4px 8px",
  textTransform: "capitalize",
  lineHeight: 1,
  h: 3,
};

const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -14],
              },
            },
          ],
        },
      }} {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 'none',
  },
});

export default function CatalogOverview({ dataSource }: DataTabProps) {
  const t = useTranslations();

  const format = useFormatter();

  // dataSourceSubactions
  const setFormatting = useProjectStore(
    (state) => state.dataSourceActions.setFormatting,
  );

  const setMetadata = useProjectStore(
    (state) => state.dataSourceActions.setMetadata,
  );

  const updateMetadata = async (dataSource: DataSource) => {
    // update bounds and metadata after setting mapped variables

    // fetch updated metadata
    const updatedMetadata = await fetchUpdatedMetadata(dataSource);

    // set metadata
    setMetadata(dataSource.internal_id, updatedMetadata);

    // colormapBounds
    const colormapsBounds = Object.keys(updatedMetadata.variables.by_id).map(
      (variable: string) => {
        const obj: { [variable: string]: [number, number] } = {};
        obj[variable] = updatedMetadata.variables.by_id[variable].bounds;
        return obj;
      },
    );

    console.log(colormapsBounds);

    const updatedColorFormatting = {
      ...dataSource.formatting.color,
      linear: {
        ...dataSource.formatting.color.linear,
        domain: Object.assign({}, ...colormapsBounds),
      },
    };

    console.log(updatedColorFormatting);

    // updatedColorFormatting.linear.domain = ;

    setFormatting(
      dataSource.internal_id,
      "color",
      updatedColorFormatting as never,
    );
  };

  const previewGridApiRef = useGridApiRef();

  const autosizeOptions = {
    includeHeaders: true,
    includeOutliers: true,
    expand: true,
  };

  useEffect(() => {
    updateMetadata(dataSource);
  }, [dataSource.metadata.sep]);

  const [amEditingName, setAmEditingName] = useState(false);
  const [previewType, setPreviewType] = useState("raw");

  const theme = useTheme();

  return (
    <Paper variant="outlined" sx={{ mb: 2, pt: 1, pb: 1 }}>
      <Stack
        sx={{
          ".full-row": {
            ml: 2,
            mr: 2,
            flexDirection: "row",
            justifyContent: "space-between",
            ".first-bit": {
              minHeight: "36px",
              alignItems: "center",
              ".row-header": {
                minWidth: "200px",
              },
            },
          },
        }}
      >
        <Stack className="full-row">
          <Typography variant="h6" sx={{ my: 1 }}>
            {t("Sources.earthquake_catalog")}
          </Typography>
        </Stack>
        <ClickAwayListener
          onClickAway={() => {
            setAmEditingName(false);
          }}
        >
          <Stack className="full-row">
            <Stack className="first-bit" direction="row">
              <Typography className="row-header" noWrap>
                <b>{t("Sources.name")}:</b>
              </Typography>

              {dataSource.name != dataSource.filename || amEditingName ? (
                <TextField
                  sx={{ marginBottom: "-4px" }}
                  size="small"
                  variant="standard"
                  value={dataSource.name}
                  fullWidth
                />
              ) : (
                <Typography
                  onClick={() => {
                    setAmEditingName(true);
                  }}
                >
                  {dataSource.name}
                </Typography>
              )}
            </Stack>
            <IconButton
              onClick={() => {
                setAmEditingName(!amEditingName);
              }}
            >
              {amEditingName ? <EditOff /> : <Edit />}
            </IconButton>
          </Stack>
        </ClickAwayListener>
        <Stack className="full-row">
          <Stack className="first-bit" direction="row" sx={{ minWidth: 0 }}>
            <Typography className="row-header">
              <b>{t("Sources.filepath")}:</b>
            </Typography>
            <NoMaxWidthTooltip placement="bottom-start" title={dataSource.filepath}>
              <Typography noWrap textOverflow="ellipsis">
                {dataSource.filepath}
              </Typography>
            </NoMaxWidthTooltip>
          </Stack>
          <IconButton>
            <Folder />
          </IconButton>
        </Stack>
        <Stack className="full-row" direction="row">
          <Stack className="first-bit" direction="row">
            <Typography className="row-header" noWrap>
              <b>{t("Sources.num_events")}:</b>
            </Typography>
            <Typography>
              {format.number(dataSource.metadata.num_events)}
            </Typography>
          </Stack>
        </Stack>
        <Divider sx={{ my: 1, mx: 2 }} />
        <Stack className="full-row" direction="row" sx={{ mb: -1 }}>
          <Stack className="first-bit" direction="row">
            <Typography className="row-header" noWrap>
              <b>{t("Sources.data_preview")}</b>
            </Typography>
          </Stack>
          <ToggleButtonGroup
            size="small"
            color="primary"
            value={previewType}
            exclusive
            onChange={(event) =>
              setPreviewType((event.target as HTMLInputElement).value)
            }
            aria-label="mode"
            sx={{ height: "24px", alignSelf: "end" }}
          >
            <ToggleButton value="raw" sx={sxButton}>
              {t("Source.raw_preview_option")}
            </ToggleButton>
            <ToggleButton value="parsed" sx={sxButton}>
              {t("Source.parsed_preview_option")}
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        {previewType == "raw" ? (
          <Paper variant="outlined" sx={{ m: 2, px: 3, pt: 2, pb: 1 }}>
            {dataSource.metadata.preview.raw.map((line, index) => (
              <Stack key={"rawPreviewCatalogLine" + index} direction="row">
                <Typography
                  variant="rawtext"
                  sx={{
                    minWidth: "1.7rem",
                    opacity: 0.6,
                    justifyContent: "center",
                  }}
                >
                  {index != 0 ? index : "#"}
                </Typography>
                <Typography noWrap variant="rawtext">
                  {line}
                </Typography>
              </Stack>
            ))}
            <Stack key={"rawPreviewCatalogFinalLine"} direction="row">
              <Typography
                variant="rawtext"
                sx={{
                  minWidth: "1.7rem",
                  opacity: 0.6,
                  ml: "2px",
                }}
              >
                &#8942;
              </Typography>
            </Stack>
          </Paper>
        ) : (
          <DataGrid
            apiRef={previewGridApiRef}
            disableColumnMenu
            disableColumnSorting
            columnHeaderHeight={36}
            columnVisibilityModel={{ id: false, t: false, dt: false }}
            rowHeight={36}
            columns={[
              ...Object.keys(dataSource.metadata.preview.parsed[0]).map(
                (key) => {
                  return { field: key, headerName: key, width: 120 };
                },
              ),
            ]}
            autosizeOptions={autosizeOptions}
            autosizeOnMount
            hideFooter
            sx={{
              m: 2,
              ".MuiDataGrid-row--lastVisible": {
                opacity: theme.palette.action.disabledOpacity,
              },
            }}
            rows={dataSource.metadata.preview.parsed}
          />
        )}
      </Stack>
    </Paper>
  );
}
