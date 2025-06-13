"use client";

import {
  Autocomplete,
  Box,
  Grid2,
  IconButton,
  TextField,
  Typography,
  Alert,
} from "@mui/material";

import {
  DataSource,
  DataSourceDataDescription,
} from "@/components/datasource/types";
import { useTranslations } from "next-intl";
import { ChangeEvent, MouseEventHandler, SyntheticEvent } from "react";
import { Clear } from "@mui/icons-material";
import { DefaultVariableMappings } from "../constants";

const VariableEditingRow = ({
  dataDescription,
  setVariableDescr,
  onRemove,
  required,
  dataSource,
}: {
  dataDescription: DataSourceDataDescription;
  onRemove?: MouseEventHandler;
  setVariableDescr: CallableFunction;
  required?: boolean;
  dataSource: DataSource;
}) => (
  <Grid2 container spacing={1} alignItems="center">
    <Grid2 size={1.5}>
      <TextField value={dataDescription.variable} size="small" disabled />
    </Grid2>
    <Grid2
      size="grow"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <TextField
        value={dataDescription.alias}
        size="small"
        fullWidth
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          if (event.target) {
            setVariableDescr(
              dataSource.internal_id,
              dataDescription.variable,
              "alias",
              event.target.value
            );
          }
        }}
      />
    </Grid2>
    <Grid2 size={2} display="flex" justifyContent="center" alignItems="center">
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
              event.target.value
            );
          }
        }}
      />
    </Grid2>
    <Grid2
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
            ? DefaultVariableMappings[dataDescription.variable as keyof typeof DefaultVariableMappings]
            : [dataDescription.variable]
        }
        options={dataSource.metadata.data_headers}
        getOptionLabel={(option: string) => option}
        size="small"
        fullWidth
        readOnly={!required}
        disabled={!required}
        onChange={(
          event: SyntheticEvent,
          newValue: string | string[] | null
        ) => {
          setVariableDescr(
            dataSource.internal_id,
            dataDescription.variable,
            "mapped_var",
            newValue
          );
        }}
        renderInput={(params) => <TextField {...params} />}
      />
      {(!required && onRemove) && (
        <IconButton sx={{ ml: 1 }} onClick={onRemove}>
          <Clear />
        </IconButton>
      )}
    </Grid2>
  </Grid2>
);

export default function DataSourceVariableForm({
  dataSource,
  setVariableDescr,
  setAddedVars,
}: {
  dataSource: DataSource;
  setVariableDescr: CallableFunction;
  setAddedVars: CallableFunction;
}) {
  const t = useTranslations();

  return (
    <>
    <Alert severity="warning" sx={{mt:1}}>Changing the variable mappings is not implemented yet, please adjust your input catalogs as a temporary work-around</Alert>
      <Grid2 container spacing={1} direction="column">
        <Grid2 container spacing={1} alignItems="flex-end">
          <Grid2 size={1.5} sx={{ ml: 1.5 }}>
            <Typography
              sx={{ opacity: 0.6, fontWeight: "bold", fontSize: "0.8rem" }}
            >
              {t("Variables.variable")}
            </Typography>
          </Grid2>
          <Grid2 size="grow">
            <Typography
              sx={{ opacity: 0.6, fontWeight: "bold", fontSize: "0.8rem" }}
            >
              {t("Variables.alias")}
            </Typography>
          </Grid2>
          <Grid2 size={2}>
            <Typography
              sx={{ opacity: 0.6, fontWeight: "bold", fontSize: "0.8rem" }}
            >
              {t("Variables.unit")}
            </Typography>
          </Grid2>
          <Grid2 size="grow">
            <Typography
              sx={{ opacity: 0.6, fontWeight: "bold", fontSize: "0.8rem" }}
            >
              {t("Variables.mapping")}
            </Typography>
          </Grid2>
        </Grid2>
        {dataSource.metadata.data_descr.map(
          (dataDescription: DataSourceDataDescription) =>
            dataDescription.required &&
            dataDescription.variable != "t" && (
              <VariableEditingRow
                key={"EditingElement-" + dataDescription.variable}
                setVariableDescr={setVariableDescr}
                dataDescription={dataDescription}
                dataSource={dataSource}
                required
              />
            )
        )}
        {dataSource.metadata.data_descr.map(
          (dataDescription: DataSourceDataDescription) =>
            !dataDescription.required &&
            dataSource.interface.addedVars.includes(
              dataDescription.variable
            ) && (
              <VariableEditingRow
                key={"EditingElement-" + dataDescription.variable}
                dataDescription={dataDescription}
                setVariableDescr={setVariableDescr}
                dataSource={dataSource}
                onRemove={() => {
                  setAddedVars(
                    dataSource.internal_id,
                    dataSource.interface.addedVars.filter(
                      (el) => el != dataDescription.variable
                    )
                  );
                }}
              />
            )
        )}
        <Grid2 container spacing={1} alignItems="center">
          <Grid2 size={1.5}>
            <Autocomplete
              options={dataSource.metadata.data_descr.filter(
                (el) =>
                  el.required == false &&
                  !dataSource.interface.addedVars.includes(el.variable)
              )}
              getOptionLabel={(option: DataSourceDataDescription) =>
                option.variable
              }
              size="small"
              fullWidth
              onChange={(
                event: SyntheticEvent,
                newValue: DataSourceDataDescription | null
              ) => {
                if (dataSource.interface.addedVars) {
                  setAddedVars(dataSource.internal_id, [
                    ...dataSource.interface.addedVars!,
                    newValue?.variable,
                  ]);
                } else {
                  setAddedVars(dataSource.internal_id, [newValue?.variable]);
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
            />
          </Grid2>
          <Grid2
            size="grow"
            display="flex"
            justifyContent="center"
            alignItems="center"
          ></Grid2>
        </Grid2>
      </Grid2>
    </>
  );
}
