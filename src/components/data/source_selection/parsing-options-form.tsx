/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Grid,
  Chip,
  Divider,
  styled,
  List,
  TextField,
} from "@mui/material";

// import {
//   DataSource,
//   DataSourceDataDescription,
//   DataSourceFormatting,
// } from "@/components/datasource/types";
import { useTranslations } from "next-intl";
// import { Dispatch, SetStateAction, useCallback } from "react";

import { SubAccordionDetails } from "../../custom/accordion";
import { useProjectStore } from "@/providers/project-store-provider";
// import { useEffect } from "react";
import DataSourceVariableForm from "../variables/variable-form";
import { DataSource } from "../../custom/types";
import { updatedMetaDataUrl } from "../data-source-query";
import { useEffect } from "react";
import { PathParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { headerFilteringStateInitializer } from "@mui/x-data-grid/internals";
import { Height } from "@mui/icons-material/index";
import { metadata } from "../../../app/[locale]/layout";
import { ChangeEvent } from "react";

interface DataTabProps {
  dataSource: DataSource;
}

const sxButton = {
  padding: "4px 8px 4px 8px",
  textTransform: "capitalize",
  lineHeight: 1,
  h: 3,
};

const ListItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

function GeneralParsingOptionsForm({ dataSource }: { dataSource: DataSource }) {
  const t = useTranslations();

  const { setSep } = useProjectStore((state) => state.metadataActions);

  return (
    <Box sx={{ px: 2 }}>
      <Typography sx={{ fontWeight: "bold", mt: 1 }}>
        {t("Variables.general_options")}
      </Typography>
      <Grid
        container
        spacing={2}
        sx={{ alignItems: "center", minHeight: "40px" }}
      >
        <Grid size={2.5}>
          <Typography variant="formlabel">{t("Sources.delimiter")}</Typography>
        </Grid>
        <Grid
          size="grow"
          display="flex"
          justifyContent="end"
          alignItems="center"
        >
          <ToggleButtonGroup
            color="primary"
            value={dataSource.metadata.sep}
            exclusive
            onChange={(event) => {
              setSep(
                dataSource.internal_id,
                (event.target as HTMLInputElement).value,
              );
            }}
            aria-label="mode"
            sx={{ height: "24px" }}
          >
            <ToggleButton value="\s+" sx={sxButton}>
              {t("Sources.whitespace")}
            </ToggleButton>
            <ToggleButton value="," sx={sxButton}>
              {t("Sources.comma")}
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>
    </Box>
  );
}

function HeaderToggle({ dataSource }: { dataSource: DataSource }) {
  const t = useTranslations();

  const { setHeader } = useProjectStore((state) => state.metadataActions);

  return (
    <Grid
      size="grow"
      display="flex"
      justifyContent="end"
      alignItems="center"
      minHeight="36px"
    >
      <Typography variant="formlabel" sx={{ mr: 1 }}>
        {t("Variables.column_names_origin")}
      </Typography>
      <ToggleButtonGroup
        color="primary"
        value={dataSource.metadata.header}
        exclusive
        onChange={(event) => {
          setHeader(
            dataSource.internal_id,
            (event.target as HTMLInputElement).value,
          );
        }}
        aria-label="mode"
        sx={{ height: "24px" }}
      >
        <ToggleButton value="from_file" sx={sxButton}>
          {t("Variables.header_from_file")}
        </ToggleButton>
        <ToggleButton value="add_header" sx={sxButton}>
          {t("Variables.add_header")}
        </ToggleButton>
        <ToggleButton value="override_header" sx={sxButton}>
          {t("Variables.override_header")}
        </ToggleButton>
      </ToggleButtonGroup>
    </Grid>
  );
}

function ColumnEditorRow({
  dataSource,
  columnIndex,
}: {
  dataSource: DataSource;
  columnIndex: number;
}) {
  const t = useTranslations();

  const setColumnName = useProjectStore(
    (state) => state.metadataActions.setColumnName,
  );

  const SharedTextFieldProps = {
    sx: {
      inputProps: {
        sx: { minHeight: "40px" },
      },
    },
  };

  return (
    <Grid container spacing={1} alignItems="flex-start">
      <Grid size={2}>
        <TextField
          value={
            dataSource.metadata.header == "override_header"
              ? dataSource.metadata.file_column_names[columnIndex]
              : "Column " + (columnIndex + 1)
          }
          size="small"
          disabled
        />
      </Grid>
      <Grid size={3} display="flex" justifyContent="center" alignItems="center">
        <TextField
          value={dataSource.metadata.column_names[columnIndex]}
          size="small"
          fullWidth
          {...SharedTextFieldProps}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            if (event.target) {
              setColumnName(
                dataSource.internal_id,
                columnIndex,
                event.target.value as never,
              );
            }
          }}
        />
      </Grid>
      <Grid
        size="grow"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Paper
          variant="outlined"
          sx={{
            minHeight: "40px",
            width: "100%",
            display: "flex",
            flexDirection: "row",
            px: 2,
            alignItems: "center",
          }}
        >
          <Typography noWrap>
            {dataSource.metadata.preview.parsed.map((value, index) => (
              <span
                key={"previewNum" + index}
                style={{ opacity: index < 9 ? 0.8 : 0.5 }}
              >
                {(dataSource.metadata.header == "add_header"
                  ? value[columnIndex]
                  : value[
                      dataSource.metadata.file_column_names[columnIndex]
                    ]) != undefined
                  ? (index == 0 ? "" : ", ") +
                    (dataSource.metadata.header == "add_header"
                      ? value[columnIndex]
                      : value[
                          dataSource.metadata.file_column_names[columnIndex]
                        ])
                  : " "}
              </span>
            ))}
            <span style={{ opacity: 0.5 }}>{"..."}</span>
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}

function ColumnEditor({ dataSource }: { dataSource: DataSource }) {
  const t = useTranslations();

  return (
    <Grid container spacing={1} direction="column">
      <Grid container sx={{ my: 1, height: ".8rem" }} direction="row">
        <Grid size={2} justifyContent={"flex-start"}>
          <Typography
            sx={{ opacity: 0.6, fontWeight: "bold", fontSize: "0.8rem" }}
          >
            {dataSource.metadata.header == "override_header"
              ? t("Variables.column_name_file")
              : t("Variables.column_number")}
          </Typography>
        </Grid>
        <Grid size={3} display="flex" justifyContent={"flex-start"}>
          <Typography
            sx={{ opacity: 0.6, fontWeight: "bold", fontSize: "0.8rem" }}
          >
            {t("Variables.column_name")}
          </Typography>
        </Grid>
        <Grid size="grow" display="flex" justifyContent={"flex-start"}>
          <Typography
            sx={{ opacity: 0.6, fontWeight: "bold", fontSize: "0.8rem" }}
          >
            {t("Variables.column_preview")}
          </Typography>
        </Grid>
      </Grid>
      {dataSource.metadata.file_column_names.map((column_name, index) => (
        <ColumnEditorRow
          key={"ColumEditorRow" + index}
          dataSource={dataSource}
          columnIndex={index}
        />
      ))}
    </Grid>
  );
}

function HeaderForm({ dataSource }: { dataSource: DataSource }) {
  const t = useTranslations();

  return (
    <Box sx={{ px: 2 }}>
      <Typography sx={{ fontWeight: "bold", mt: 1 }}>
        {t("Variables.catalog_header")}
      </Typography>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          my: 2,
        }}
      >
        <Grid
          container
          spacing={2}
          sx={{
            alignItems: "center",
            justifyContent: "end",
            minHeight: "36px",
            my: -0.5,
          }}
        >
          <Grid size={2.5} sx={{ mb: "4px" }}>
            <Typography sx={{ fontWeight: "bold", fontSize: 14 }}>
              {t("Variables.column_names")}
            </Typography>
          </Grid>
          <HeaderToggle dataSource={dataSource} />
        </Grid>
        {dataSource.metadata.header == "from_file" ? (
          <List
            sx={{
              flexWrap: "wrap",
              listStyle: "none",
              display: "flex",
              justifyContent: "left",
            }}
          >
            {dataSource.metadata.file_column_names.map((column_name) => (
              <ListItem key={"HeaderChip" + column_name}>
                <Chip variant="outlined" label={column_name} />
              </ListItem>
            ))}
          </List>
        ) : (
          <ColumnEditor dataSource={dataSource} />
        )}
      </Paper>
    </Box>
  );
}

export const fetchUpdatedMetadata = async (dataSource: DataSource) => {
  return await fetch(updatedMetaDataUrl(dataSource)).then((res) => res.json());
};

export default function ParsingForm({ dataSource }: DataTabProps) {
  const t = useTranslations();

  const { setIndex, setSep, setDatetimeFormat } = useProjectStore(
    (state) => state.metadataActions,
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
  };

  useEffect(() => {
    updateMetadata(dataSource);
  }, [dataSource.metadata.sep]);

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden", mb: 2 }}>
      <Box display="flex" sx={{ m: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>
          {t("Sources.parsing_options")}
        </Typography>
      </Box>

      <SubAccordionDetails>
        <GeneralParsingOptionsForm dataSource={dataSource} />
        <Divider sx={{ mx: 2, mt: 1, mb: 2 }} />
        <HeaderForm dataSource={dataSource} />
        <Divider sx={{ mx: 2, mt: 1 }} />
        <DataSourceVariableForm dataSource={dataSource} />
      </SubAccordionDetails>
    </Paper>
  );
}
