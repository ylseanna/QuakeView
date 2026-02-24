/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  Autocomplete,
  Box,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
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
import { Nuke } from "mdi-material-ui";
import {
  datePlusTimeStringRequiredVars,
  dateTimeAsNumbersRequiredVars,
  dateTimeStringRequiredVars,
} from "../constants";
import{ useCatalogData } from "../use-data";

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

  useEffect(() => {
    let mappedVarCheck = false;

    const requiredVars =
      dataSource.metadata.datetime_format == "parseable_datetime_string"
        ? dateTimeStringRequiredVars
        : dataSource.metadata.datetime_format == "date_string-time_string"
          ? datePlusTimeStringRequiredVars
          : dateTimeAsNumbersRequiredVars;

    mappedVarCheck = requiredVars
      .map((requiredVar) => {
        const description = dataSource.metadata.variables.by_id[requiredVar];

        console.log(requiredVar);

        return !(
          dataSource.metadata.index == "from_file" ? [] : ["id"]
        ).includes(requiredVar)
          ? description.mapped_var
              .map((mapped_var) =>
                dataSource.metadata.catalog_headers.includes(mapped_var),
              )
              .some((check) => check)
          : true;
      })
      .every((check) => check);

    if (mappedVarCheck != dataSource.interface.loadable) {
      setLoadable(dataSource.internal_id, mappedVarCheck);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataDescription.mapped_var]);

  const SharedTextFieldProps = {
    sx: {
      inputProps: {
        sx: { minHeight: "40px" },
      },
    },
  };

  return (
    <Grid container spacing={1} alignItems="flex-start">
      <Grid sx={{ width: "120px" }}>
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
        size={1.8}
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

  const clearAllVariableMaps = useProjectStore(
    (state) => state.metadataActions.clearAllVariableMaps,
  );

  const setColorFormatting = useProjectStore(
    (state) => state.dataSourceActions.setColorFormatting,
  );

  const { data } = useCatalogData();

  const { dataSources } = useProjectStore((state) => state);

  useEffect(() => {
    if (data) {
      data.allIDs.forEach((dataSourceID) => {
        ["twoD", "threeD", "plot"].forEach((type) => {
          const formattingType = type as "twoD" | "threeD" | "plot";

          const boundsFromData = {} as {
            [variable: string]: [number, number] | null;
          };

          dataSource.metadata.variables.required_vars
            .concat(dataSource.metadata.variables.datetime_vars)
            .concat(dataSource.metadata.variables.added_vars)
            .concat(["t"])
            .forEach((variable) => {
              return (boundsFromData[variable] = dataSource.formatting[
                formattingType
              ].color.linear.domain[
                dataSource.formatting[formattingType].color.linear.variable
              ]
                ? dataSource.formatting[formattingType].color.linear.domain[
                    dataSource.formatting[formattingType].color.linear.variable
                  ]
                : data.byID[dataSourceID].bounds[variable]);
            });

          setColorFormatting(dataSourceID, formattingType, {
            ...dataSources.byID[dataSourceID].formatting[formattingType].color,
            linear: {
              ...dataSources.byID[dataSourceID].formatting[formattingType].color
                .linear,
              domain: boundsFromData,
            },
          });
        });
      });
    }
  }, [data.allIDs]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography sx={{ fontWeight: "bold" }}>
        {t("Sources.variable_mapping")}
      </Typography>
      <Grid container spacing={1} direction="column">
        <Grid container spacing={1} alignItems="flex-end">
          <Grid sx={{ width: "120px" }}>
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
          <Grid size={1.8}>
            <Typography
              sx={{ opacity: 0.6, fontWeight: "bold", fontSize: "0.8rem" }}
            >
              {t("Variables.unit")}
            </Typography>
          </Grid>
          <Grid
            size="grow"
            sx={{
              flexDirection: "column",
              display: "flex",
              alignItems: "stretch",
            }}
          >
            <Stack
              display="flex"
              direction="row"
              justifyContent="space-between"
              alignItems="end"
            >
              <Typography
                sx={{ opacity: 0.6, fontWeight: "bold", fontSize: "0.8rem" }}
              >
                {t("Variables.mapping")}
              </Typography>
              <Tooltip
                title={t("Variables.clear_all_maps")}
                slotProps={{
                  popper: {
                    modifiers: [
                      {
                        name: "offset",
                        options: {
                          offset: [0, -10],
                        },
                      },
                    ],
                  },
                }}
              >
                <IconButton
                  onClick={() => clearAllVariableMaps(dataSource.internal_id)}
                  size="small"
                  sx={{ mb: "-6px" }}
                >
                  <Nuke sx={{ height: "16px", width: "16px" }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Grid>
        </Grid>
        {dataSource.metadata.datetime_format ==
        "year-month-day-hour-minute-second"
          ? [
              ...(dataSource.metadata.index == "from_file" ? ["id"] : []),
              ...dataSource.metadata.variables.datetime_vars.filter(
                (variable) => !["doy", "date", "time"].includes(variable),
              ),
              ...dataSource.metadata.variables.required_vars.filter(
                (variable) => !["id", "dt", "t"].includes(variable),
              ),
            ].map((variable: string, index) => (
              <Box key={"EditingElement-" + variable}>
                {dataSource.metadata.index == "from_file" && index == 1 ? (
                  <Divider textAlign="left" sx={{ mb: 1 }}>
                    <span style={{ opacity: 0.4 }}>
                      {t("Variables.time_variables")}
                    </span>
                  </Divider>
                ) : (
                  index ==
                    (dataSource.metadata.index == "from_file" ? 7 : 6) && (
                    <Divider sx={{ mb: 1 }} />
                  )
                )}
                <VariableEditingRow
                  dataDescription={
                    dataSource.metadata.variables.by_id[variable]
                  }
                  dataSource={dataSource}
                  required
                />
              </Box>
            ))
          : dataSource.metadata.datetime_format == "date_string-time_string"
            ? [
                ...(dataSource.metadata.index == "from_file" ? ["id"] : []),
                ...dataSource.metadata.variables.datetime_vars.filter(
                  (variable) =>
                    ![
                      "year",
                      "month",
                      "day",
                      "doy",
                      "hour",
                      "minute",
                      "second",
                    ].includes(variable),
                ),
                ...dataSource.metadata.variables.required_vars.filter(
                  (variable) => !["id", "dt", "t"].includes(variable),
                ),
              ].map((variable: string, index) => (
                <Box key={"EditingElement-" + variable}>
                  {dataSource.metadata.index == "from_file" && index == 1 ? (
                    <Divider textAlign="left" sx={{ my: 1, mb: 2 }}>
                      <span style={{ opacity: 0.4 }}>
                        {t("Variables.time_variables")}
                      </span>
                    </Divider>
                  ) : (
                    index ==
                      (dataSource.metadata.index == "from_file" ? 3 : 2) && (
                      <Divider sx={{ my: 1, mb: 2 }} />
                    )
                  )}
                  <VariableEditingRow
                    dataDescription={
                      dataSource.metadata.variables.by_id[variable]
                    }
                    dataSource={dataSource}
                    required
                  />
                </Box>
              ))
            : dataSource.metadata.variables.required_vars.map(
                (variable: string) =>
                  !(
                    dataSource.metadata.index == "from_file"
                      ? ["t"]
                      : ["t", "id"]
                  ).includes(variable) && (
                    <VariableEditingRow
                      key={"EditingElement-" + variable}
                      dataDescription={
                        dataSource.metadata.variables.by_id[variable]
                      }
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
          <Grid sx={{ width: "120px" }}>
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
    </Box>
  );
}
