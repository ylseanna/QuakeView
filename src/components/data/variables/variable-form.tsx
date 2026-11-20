/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  Autocomplete,
  Box,
  Checkbox,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  ToggleButton,
  Tooltip,
  Typography,
  ToggleButtonGroup,
} from "@mui/material";

import {
  DataSource,
  DataSourceDataDescription,
} from "@/components/custom/types";
import { useTranslations } from "next-intl";
import {
  ChangeEvent,
  MouseEventHandler,
  ReactNode,
  SyntheticEvent,
  useEffect,
  useState,
} from "react";
import { Check, CheckBox, Clear } from "@mui/icons-material";
import { useProjectStore } from "@/providers/project-store-provider";
import { updatedMetaDataUrl } from "../data-source-query";
import { Nuke, Numeric, Numeric0, NumericOff } from "mdi-material-ui";
import {
  datePlusTimeStringRequiredVars,
  dateTimeAsNumbersRequiredVars,
  dateTimeStringRequiredVars,
} from "../../custom/constants";
import { useCatalogData } from "../use-data";

export const fetchUpdatedMetadata = async (dataSource: DataSource) => {
  return await fetch(updatedMetaDataUrl(dataSource)).then((res) => res.json());
};

const sxButton = {
  padding: "4px 8px 4px 8px",
  textTransform: "capitalize",
  lineHeight: 1,
  h: 3,
};

function DateTimeFormatToggle({ dataSource }: { dataSource: DataSource }) {
  const t = useTranslations();

  const { setDatetimeFormat } = useProjectStore(
    (state) => state.metadataActions,
  );

  return (
    <Grid
      container
      spacing={2}
      sx={{
        alignItems: "end",
        justifyContent: "end",
        minHeight: "36px",
        my: -0.5,
      }}
    >
      <Grid size={2.5} sx={{ mb: "4px" }}>
        <Typography variant="formlabel" sx={{ fontSize: 14 }}>
          {t("Variables.datetime")}
        </Typography>
      </Grid>
      <Grid
        size="grow"
        display="flex"
        justifyContent="end"
        alignItems="center"
        minHeight="36px"
      >
        <Typography variant="formlabel" sx={{ mr: 1 }}>
          {t("Variables.format")}
        </Typography>
        <ToggleButtonGroup
          color="primary"
          value={dataSource.metadata.datetime_format}
          exclusive
          onChange={(event) => {
            setDatetimeFormat(
              dataSource.internal_id,
              (event.target as HTMLInputElement).value,
            );
          }}
          aria-label="mode"
          sx={{ height: "24px" }}
        >
          <ToggleButton value="parseable_datetime_string" sx={sxButton}>
            {t("Sources.parseable_datetime_string")}
          </ToggleButton>
          <ToggleButton value="date_string-time_string" sx={sxButton}>
            {t("Sources.date_string-time_string")}
          </ToggleButton>
          <ToggleButton value="year-month-day-hour-minute-second" sx={sxButton}>
            {t("Sources.year-month-day-hour-minute-second")}
          </ToggleButton>
        </ToggleButtonGroup>
      </Grid>
    </Grid>
  );
}

function VariableEditingRow({
  dataDescription,
  onRemove,
  required,
  dataSource,
  children,
}: {
  dataDescription: DataSourceDataDescription;
  onRemove?: MouseEventHandler;
  required?: boolean;
  dataSource: DataSource;
  children?: ReactNode | ReactNode[];
}) {
  const t = useTranslations();

  const setVariableDescr = useProjectStore(
    (state) => state.dataSourceActions.setVariableDescr,
  );

  const setLoadable = useProjectStore(
    (state) => state.dataSourceActions.setLoadable,
  );

  const [isValid, setIsValid] = useState<boolean>(false);

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

        return !(
          dataSource.metadata.index == "from_file" ? [] : ["id"]
        ).includes(requiredVar)
          ? description.mapped_var
              .map((mapped_var) =>
                dataSource.metadata.column_names.includes(mapped_var),
              )
              .some((check) => check)
          : true;
      })
      .every((check) => check);

    if (mappedVarCheck != dataSource.interface.loadable) {
      setLoadable(dataSource.internal_id, mappedVarCheck);
    }
    setIsValid(
      required
        ? dataDescription.mapped_var
            .map((mapped_var) =>
              dataSource.metadata.column_names.includes(mapped_var),
            )
            .some((check) => check)
          ? true
          : false
        : true,
    );
  }, [
    dataDescription.variable,
    dataDescription.mapped_var,
    dataSource.metadata.sep,
    dataSource.metadata.datetime_format,
    dataSource.metadata.index,
  ]);

  const SharedTextFieldProps = {
    sx: {
      inputProps: {
        sx: { minHeight: "40px" },
      },
    },
  };

  return (
    <Grid
      container
      spacing={1}
      alignItems="flex-start"
      sx={{ mb: isValid ? 0 : -0.5 }}
    >
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
        alignItems="start"
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
          options={dataSource.metadata.column_names}
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
                        dataSource.metadata.column_names.includes(
                          mapped_var,
                        ),
                      )
                      .some((check) => check)
                  : false
              }
              helperText={
                isValid ? undefined : (
                  <span>{t("Variables.mapping_warning")}</span>
                )
              }
            />
          )}
        />
        {children}
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

  const { setIndex } = useProjectStore((state) => state.metadataActions);
  const clearAllVariableMaps = useProjectStore(
    (state) => state.metadataActions.clearAllVariableMaps,
  );

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
        <Box>
          <VariableEditingRow
            dataDescription={dataSource.metadata.variables.by_id["id"]}
            dataSource={dataSource}
            required={dataSource.metadata.index == "numerical" ? false : true}
          >
            <Grid
              sx={{ height: "40px", ml: 1 }}
              display="flex"
              justifyContent="end"
              alignItems="center"
            >
              <Tooltip title={t("Sources.index")}>
                <Checkbox
                  checked={
                    dataSource.metadata.index == "numerical" ? true : false
                  }
                  onChange={(event) => {
                    setIndex(
                      dataSource.internal_id,
                      event.target!.checked ? "numerical" : "from_file",
                    );
                  }}
                  icon={<NumericOff />}
                  checkedIcon={<Numeric />}
                  slotProps={{ input: { "aria-label": "controlled" } }}
                />
              </Tooltip>
            </Grid>
          </VariableEditingRow>
        </Box>
        <Divider textAlign="left" sx={{ mt: 0.5 }} />
        <DateTimeFormatToggle dataSource={dataSource} />
        {dataSource.metadata.datetime_format ==
        "year-month-day-hour-minute-second" ? (
          dataSource.metadata.variables.datetime_vars
            .filter((variable) => !["doy", "date", "time"].includes(variable))
            .map((variable: string, index) => (
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
        ) : dataSource.metadata.datetime_format == "date_string-time_string" ? (
          dataSource.metadata.variables.datetime_vars
            .filter(
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
            )
            .map((variable: string, index) => (
              <VariableEditingRow
                key={"EditingElement-" + variable}
                dataDescription={dataSource.metadata.variables.by_id[variable]}
                dataSource={dataSource}
                required
              />
            ))
        ) : (
          <VariableEditingRow
            key={"EditingElement-dt"}
            dataDescription={dataSource.metadata.variables.by_id["dt"]}
            dataSource={dataSource}
            required
          />
        )}
        <Divider textAlign="left" sx={{ my: 1 }} />
        <Typography variant="formlabel">{t("Variables.location")}</Typography>

        {dataSource.metadata.variables.required_vars
          .filter((variable) => !["id", "dt", "t", "mag"].includes(variable))
          .map((variable: string, index) => (
            <VariableEditingRow
              key={"EditingElement-" + variable}
              dataDescription={dataSource.metadata.variables.by_id[variable]}
              dataSource={dataSource}
              required
            />
          ))}
        <Divider textAlign="left" sx={{ my: 1 }} />
        <Typography variant="formlabel">{t("Variables.magnitude")}</Typography>
        <VariableEditingRow
          key={"EditingElement-mag"}
          dataDescription={dataSource.metadata.variables.by_id["mag"]}
          dataSource={dataSource}
          required
        />
        <Divider textAlign="left" sx={{ my: 1 }} />
        <Typography variant="formlabel">{t("Variables.optional")}</Typography>
        {dataSource.metadata.variables.added_vars
          .filter((variable) =>
            dataSource.metadata.column_names.includes(variable),
          )
          .map((variable: string) => (
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
