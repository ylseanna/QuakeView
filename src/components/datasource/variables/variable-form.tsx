"use client";

import {
  Autocomplete,
  Box,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";

import {
  DataSource,
  DataSourceDataDescription,
} from "@/components/datasource/types";
import { useTranslations } from "next-intl";
import {
  ChangeEvent,
  MouseEventHandler,
  SyntheticEvent,
  useEffect,
} from "react";
import { Clear } from "@mui/icons-material";
import { useProjectStore } from "@/providers/project-store-provider";
import { updatedMetaDataUrl } from "../data-source-query";

export const fetchUpdatedMetadata = async (dataSource: DataSource) => {
  return await fetch(updatedMetaDataUrl(dataSource)).then((res) => res.json());
};

function VariableEditingRow({
  dataDescription,
  onRemove,
  required,
  dataSource,
}: {
  dataDescription: DataSourceDataDescription;
  onRemove?: MouseEventHandler;
  required?: boolean;
  dataSource: DataSource;
}) {
  const t = useTranslations();

  const setVariableDescr = useProjectStore(
    (state) => state.dataSourceActions.setVariableDescr,
  );

  const setLoadable = useProjectStore(
    (state) => state.dataSourceActions.setLoadable,
  );

  const setMetadata = useProjectStore(
    (state) => state.dataSourceActions.setMetadata,
  );

  const setFormatting = useProjectStore(
    (state) => state.dataSourceActions.setFormatting,
  );

  const updateMetaData = async (dataSource: DataSource) => {
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

  useEffect(() => {
    const mappedVarCheck = dataSource.metadata.variables.required_vars
      .map((requiredVar) => {
        const description = dataSource.metadata.variables.by_id[requiredVar];

        return description.variable != "t"
          ? description.mapped_var
              .map((mapped_var) =>
                dataSource.metadata.catalog_headers.includes(mapped_var),
              )
              .some((check) => check)
          : true;
      })
      .every((check) => check);

    console.log(mappedVarCheck);

    if (mappedVarCheck != dataSource.interface.loadable) {
      updateMetaData(dataSource);
      setLoadable(dataSource.internal_id, mappedVarCheck);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataDescription.mapped_var]);

  const SharedTextFieldProps = {
    sx: {
      inputProps: {
        sx: {minHeight: "40px"}
      }
    },
  };

  return (
    <Grid container spacing={1} alignItems="flex-start">
      <Grid size={1.5}>
        <TextField value={dataDescription.variable} size="small" disabled />
      </Grid>
      <Grid
        size={2.5}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <TextField
          value={dataDescription.alias}
          size="small"
          fullWidth
          {...SharedTextFieldProps}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            if (event.target) {
              setVariableDescr(
                dataSource.internal_id,
                dataDescription.variable,
                "alias",
                event.target.value as never,
              );
            }
          }}
        />
      </Grid>
      <Grid
        size={1.5}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <TextField
          value={dataDescription.unit}
          size="small"
          fullWidth
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            if (event.target) {
              setVariableDescr(
                dataSource.internal_id,
                dataDescription.variable,
                "unit",
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
        <Autocomplete
          multiple
          freeSolo
          value={
            required
              ? dataSource.metadata.variables.by_id[dataDescription.variable]
                  .mapped_var
              : [dataDescription.variable]
          }
          options={dataSource.metadata.catalog_headers}
          getOptionLabel={(option: string) => option}
          size="small"
          fullWidth
          limitTags={5}
          readOnly={!required}
          disabled={!required}
          onChange={(
            event: SyntheticEvent,
            newValue: string | string[] | null,
          ) => {
            setLoadable(dataSource.internal_id, false);
            setVariableDescr(
              dataSource.internal_id,
              dataDescription.variable,
              "mapped_var",
              newValue as never,
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              error={
                dataDescription.mapped_var
                  ? !dataDescription.mapped_var
                      .map((mapped_var) =>
                        dataSource.metadata.catalog_headers.includes(
                          mapped_var,
                        ),
                      )
                      .some((check) => check)
                  : false
              }
              helperText={
                required ? (
                  dataDescription.mapped_var ? (
                    !dataDescription.mapped_var
                      .map((mapped_var) =>
                        dataSource.metadata.catalog_headers.includes(
                          mapped_var,
                        ),
                      )
                      .some((check) => check) ? (
                      <span>{t("Variables.mapping_warning")}</span>
                    ) : undefined
                  ) : (
                    <span>{t("Variables.mapping_warning")}</span>
                  )
                ) : undefined
              }
            />
          )}
        />
        {!required && onRemove && (
          <IconButton sx={{ ml: 1 }} onClick={onRemove}>
            <Clear />
          </IconButton>
        )}
      </Grid>
    </Grid>
  );
}

export default function DataSourceVariableForm({
  dataSource,
}: {
  dataSource: DataSource;
}) {
  const t = useTranslations();

  const setAddedVars = useProjectStore(
    (state) => state.dataSourceActions.setAddedVars,
  );

  return (
    <>
      <Grid container spacing={1} direction="column">
        <Grid container spacing={1} alignItems="flex-end">
          <Grid size={1.5} sx={{ ml: 1.5 }}>
            <Typography
              sx={{ opacity: 0.6, fontWeight: "bold", fontSize: "0.8rem" }}
            >
              {t("Variables.variable")}
            </Typography>
          </Grid>
          <Grid size={2.5}>
            <Typography
              sx={{ opacity: 0.6, fontWeight: "bold", fontSize: "0.8rem" }}
            >
              {t("Variables.alias")}
            </Typography>
          </Grid>
          <Grid size={1.5}>
            <Typography
              sx={{ opacity: 0.6, fontWeight: "bold", fontSize: "0.8rem" }}
            >
              {t("Variables.unit")}
            </Typography>
          </Grid>
          <Grid size="grow">
            <Typography
              sx={{ opacity: 0.6, fontWeight: "bold", fontSize: "0.8rem" }}
            >
              {t("Variables.mapping")}
            </Typography>
          </Grid>
        </Grid>
        {dataSource.metadata.variables.required_vars.map(
          (variable: string) =>
            variable != "t" && (
              <VariableEditingRow
                key={"EditingElement-" + variable}
                dataDescription={dataSource.metadata.variables.by_id[variable]}
                dataSource={dataSource}
                required
              />
            ),
        )}
        {dataSource.metadata.variables.added_vars.map((variable: string) => (
          <VariableEditingRow
            key={"EditingElement-" + variable}
            dataDescription={dataSource.metadata.variables.by_id[variable]}
            dataSource={dataSource}
            onRemove={() => {
              setAddedVars(
                dataSource.internal_id,
                dataSource.metadata.variables.added_vars.filter(
                  (el) => el != variable,
                ),
              );
            }}
          />
        ))}
        <Grid container spacing={1} alignItems="center">
          <Grid size={1.5}>
            <Autocomplete
              options={dataSource.metadata.variables.optional_vars
                .filter(
                  (variable) =>
                    !dataSource.metadata.variables.added_vars.includes(
                      variable,
                    ),
                )
                .map(
                  (variable) => dataSource.metadata.variables.by_id[variable],
                )}
              getOptionLabel={(option: DataSourceDataDescription) =>
                option.variable
              }
              size="small"
              fullWidth
              clearOnBlur
              clearOnEscape
              onChange={(
                event: SyntheticEvent,
                newValue: DataSourceDataDescription | null,
              ) => {
                if (newValue != null) {
                  if (dataSource.metadata.variables.added_vars) {
                    setAddedVars(dataSource.internal_id, [
                      ...dataSource.metadata.variables.added_vars!,
                      newValue.variable,
                    ]);
                  } else {
                    setAddedVars(dataSource.internal_id, [newValue.variable]);
                  }
                }
              }}
              renderInput={(params) => (
                <TextField {...params} label={t("Sources.add")} />
              )}
              renderOption={(props, option: DataSourceDataDescription) => {
                const { key, ...optionProps } = props;
                return (
                  <Box key={key} component="li" {...optionProps}>
                    {option.variable}
                  </Box>
                );
              }}
              disableClearable
            />
          </Grid>
          <Grid
            size="grow"
            display="flex"
            justifyContent="center"
            alignItems="center"
          ></Grid>
        </Grid>
      </Grid>
    </>
  );
}
