/* eslint-disable @next/next/no-img-element */
"use client";

import { Close, ExpandMore, Numbers } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Grid2,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

import { DataSource } from "@/components/datasource/types";
import {
  SubAccordion,
  SubAccordionDetails,
  SubAccordionSummary,
} from "../../layout/accordion";
import { SyntheticEvent, useState } from "react";
import { useTranslations } from "next-intl";
import HistogramSlider from "../../d3/histogram-slider";

type FilteringOption = {
  variable: string;
  alias?: string;
  bounds: [number, number];
};

const FilteringEditingRow = ({
  variable,
  bounds,
  setFiltering,
  dataSource,
}: {
  variable: string;
  bounds: [number, number];
  setFiltering: CallableFunction;
  dataSource: DataSource;
}) => {
  const t = useTranslations("Filtering");

  const theme = useTheme();

  const dataDescr = dataSource.metadata.data_descr.find(
    (dataDescription) => dataDescription?.variable == variable
  );

  const [localDomain, setLocalDomain] = useState<[number, number]>(bounds);

  return (
    <SubAccordion variant="outlined" sx={{ borderRadius: theme.spacing(1) }}>
      <Box sx={{ display: "flex" }}>
        <SubAccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel2a-header"
          sx={{ flexGrow: 1 }}
        >
          <Numbers sx={{ opacity: 0.6, mr: 1 }} />
          <Typography>
            {dataDescr?.alias ? dataDescr.alias : dataDescr?.variable}
          </Typography>
        </SubAccordionSummary>
        {(variable != "mag" && variable != "t") && (
          <Tooltip title={t("remove_filter")}>
            <Box sx={{ display: "flex", p: 1, pl: 0 }}>
              <IconButton
                size="small"
                onClick={() =>
                  setFiltering(dataSource.internal_id, variable, null)
                }
              >
                <Close />
              </IconButton>
            </Box>
          </Tooltip>
        )}
      </Box>
      <SubAccordionDetails>
        <HistogramSlider
          dataSource={dataSource}
          variable={variable}
          id={`filter-chart-${dataSource.internal_id}-${variable}`}
          value={localDomain}
          min={dataDescr!.bounds[0]}
          max={dataDescr!.bounds[1]}
          onChange={(event: Event, newValue: number | number[]) => {
            setLocalDomain(newValue as [number, number]);
            setFiltering(dataSource.internal_id, variable, newValue);
          }}
          onChangeCommitted={(
            event: Event | SyntheticEvent<Element, Event>,
            newValue: number | number[]
          ) => {
            setFiltering(dataSource.internal_id, variable, newValue);
          }}
        />
      </SubAccordionDetails>
    </SubAccordion>
  );
};

export default function FilteringForm({
  dataSource,
  setFiltering,
}: {
  dataSource: DataSource;
  setFiltering: CallableFunction;
}) {
  const t = useTranslations("Filtering");

  return (
    <>
      <Autocomplete
        disabled
        options={dataSource.metadata.data_descr
          .filter(
            (el) =>
              el.data_type == "number" &&
              !Object.keys(dataSource.filtering).includes(el.variable) &&
              (el.required ||
                dataSource.interface.addedVars.includes(el.variable))
          )
          .map(
            (el) =>
              ({
                variable: el.variable,
                alias: el.alias,
                bounds: el.bounds,
              }) as FilteringOption
          )}
        getOptionLabel={(option) =>
          option.alias ? option.alias : option.variable
        }
        size="small"
        fullWidth
        onChange={(event: SyntheticEvent, option: FilteringOption | null) => {
          setFiltering(
            dataSource.internal_id,
            option?.variable,
            option?.bounds
          );
        }}
        renderInput={(params) => (
          <TextField {...params} label={t("add_filter")} />
        )}
        renderOption={(props, option: FilteringOption) => {
          const { key, ...optionProps } = props;
          return (
            <Box key={key} component="li" {...optionProps}>
              {option.alias ? option.alias : option.variable}
            </Box>
          );
        }}
        sx={{mt:1}}
      />
      <Grid2 container direction="column" spacing={1} sx={{ mt: 1 }}>
        {Object.entries(dataSource.filtering).map(
          ([variable, bounds]) =>
 (
              <FilteringEditingRow
                key={
                  "FilteringOption-" + variable + "-" + dataSource.internal_id
                }
                variable={variable}
                bounds={bounds}
                setFiltering={setFiltering}
                dataSource={dataSource}
              />
            )
        )}
      </Grid2>
    </>
  );
}
