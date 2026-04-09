"use client";

import { Close, Edit, EditOff } from "@mui/icons-material";
import {
  Box,
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

import { useState } from "react";
import { DataSource } from "../../custom/types";
import { updatedMetaDataUrl } from "../data-source-query";
import { DataGrid } from "@mui/x-data-grid";
import { Folder, TrashCan } from "mdi-material-ui";
import { useProjectStore } from "@/providers/project-store-provider";
import { SubAccordionDetails } from "@/components/custom/accordion";

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
  <Tooltip
    slotProps={{
      popper: {
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, -14],
            },
          },
        ],
      },
    }}
    {...props}
    classes={{ popper: className }}
  />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: "none",
  },
});

export default function CatalogOverview({ dataSource }: DataTabProps) {
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

  const removeDataSource = useProjectStore(
    (state) => state.dataSourceActions.removeDataSource,
  );

  return (
    <Paper variant="outlined" sx={{ mb: 2, pt: 1, pb: 0 }}>
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
        <Box display="flex" sx={{ mx: 2, mt: 1, mb: 2 }}>
          <Typography sx={{ fontWeight: "bold", m: 0 }}>
            {t("Sources.overview")}
          </Typography>
        </Box>
        <SubAccordionDetails sx={{pt: 1.5}}>
          <ClickAwayListener
            onClickAway={() => {
              setAmEditingName(false);
            }}
          >
            <Stack className="full-row">
              <Stack className="first-bit" direction="row" flex={1}>
                <Typography className="row-header" noWrap>
                  <b>{t("Sources.name")}:</b>
                </Typography>

                {dataSource.name != dataSource.filename || amEditingName ? (
                  <TextField
                    sx={{ mb: "-4px", mr: 2 }}
                    size="small"
                    variant="standard"
                    value={dataSource.name}
                    fullWidth
                    slotProps={{ input: { sx: { height: 24 } } }}
                    onChange={(event) => {
                      setName(dataSource.internal_id, event.target!.value);
                    }}
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
          {dataSource.filename != dataSource.name && (
            <Stack className="full-row">
              <Stack className="first-bit" direction="row" sx={{ minWidth: 0 }}>
                <Typography className="row-header">
                  <b>{t("Sources.filename")}:</b>
                </Typography>

                <Typography noWrap textOverflow="ellipsis">
                  {dataSource.filename}
                </Typography>
              </Stack>
            </Stack>
          )}
          <Stack className="full-row">
            <Stack className="first-bit" direction="row" sx={{ minWidth: 0 }}>
              <Typography className="row-header">
                <b>{t("Sources.filepath")}:</b>
              </Typography>
              <NoMaxWidthTooltip
                placement="bottom-start"
                title={dataSource.filepath}
              >
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
              <ToggleButton value="parsed" sx={sxButton}>
                {t("Source.parsed_preview_option")}
              </ToggleButton>
              <ToggleButton value="raw" sx={sxButton}>
                {t("Source.raw_preview_option")}
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
        </SubAccordionDetails>
      </Stack>
    </Paper>
  );
}
