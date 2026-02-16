"use client";

import { Close, ExpandMore, Numbers } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Grid,
  IconButton,
  LinearProgress,
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
import { ChangeEvent, SyntheticEvent, useState } from "react";
import { useTranslations } from "next-intl";
import HistogramSlider from "../../interface-elements/histogram-slider";
import { useData } from "../use-data";
import { useProjectStore } from "@/providers/project-store-provider";
import { PickerValue } from "@mui/x-date-pickers/internals";
import { Dayjs } from "dayjs";

type FilteringOption = {
  variable: string;
  alias?: string;
  bounds: [number, number];
};

const FilteringEditingRow = ({
  variable,
  bounds,
  dataSource,
}: {
  variable: string;
  bounds: [number, number];
  dataSource: DataSource;
}) => {
  const t = useTranslations("Filtering");

  const theme = useTheme();

  const { data } = useData();

  const dataDescr = dataSource.metadata.variables.by_id[variable];

  const [localDomain, setLocalDomain] = useState<[number, number]>(bounds);

  const { setFilter, removeFilter } = useProjectStore(
    (state) => state.dataSourceActions,
  );

  // Math.log10(-countDecimals(minVal));
  return (
    <SubAccordion
      variant="outlined"
      sx={{ borderRadius: theme.spacing(1), width: "100%" }}
    >
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
        <Tooltip title={t("remove_filter")}>
          <Box sx={{ display: "flex", p: 1, pl: 0 }}>
            <IconButton
              size="small"
              onClick={() => removeFilter(dataSource.internal_id, variable)}
            >
              <Close />
            </IconButton>
          </Box>
        </Tooltip>
      </Box>
      <SubAccordionDetails sx={{ p: 0 }}>
        {!data.byID[dataSource.internal_id] && <LinearProgress />}
        {data.byID[dataSource.internal_id] && (
          <HistogramSlider
            dataSource={dataSource}
            variable={variable}
            id={`filter-chart-${dataSource.internal_id}-${variable}`}
            value={localDomain}
            timeSlider={variable == "t"}
            min={
              data.byID[dataSource.internal_id].unfiltered_bounds[variable]![0]
            }
            max={
              data.byID[dataSource.internal_id].unfiltered_bounds[variable]![1]
            }
            onChange={(event: Event, newValue: number | number[]) => {
              setLocalDomain(newValue as [number, number]);
            }}
            onChangeCommitted={() => {
              setFilter(dataSource.internal_id, variable, localDomain);
            }}
            numberInputs
            onChangeNumberInputsMin={(event: ChangeEvent<HTMLInputElement>) => {
              setLocalDomain([Number(event.target.value), localDomain[1]]);
            }}
            onChangeDateTimeInputsMin={(value: PickerValue) => {
              setLocalDomain([(value as Dayjs)!.valueOf(), localDomain[1]]);
            }}
            onAcceptDateTimeInputsMin={(value: PickerValue) => {
              setFilter(dataSource.internal_id, variable, [(value as Dayjs)!.valueOf(), localDomain[1]]);
            }}
            onChangeNumberInputsMax={(event: ChangeEvent<HTMLInputElement>) => {
              setLocalDomain([localDomain[0], Number(event.target.value)]);
            }}
            onChangeDateTimeInputsMax={(value: PickerValue) => {
              setLocalDomain([localDomain[0], (value as Dayjs)!.valueOf()]);
            }}
            onAcceptDateTimeInputsMax={(value: PickerValue) => {
              setFilter(dataSource.internal_id, variable, [localDomain[0], (value as Dayjs)!.valueOf()]);
            }}
            onBlurNumberInputs={() => {
              setFilter(dataSource.internal_id, variable, localDomain);
            }}
          />
        )}
      </SubAccordionDetails>
    </SubAccordion>
  );
};

export default function FilteringForm({
  dataSource,
}: {
  dataSource: DataSource;
}) {
  const t = useTranslations("Filtering");

  const { data } = useData();

  const { setFilter } = useProjectStore((state) => state.dataSourceActions);

  return (
    <>
      <Autocomplete
        options={dataSource.metadata.variables.required_vars
          .concat(dataSource.metadata.variables.added_vars)
          .filter(
            (variable) =>
              dataSource.metadata.variables.by_id[variable].data_type ==
                "number" && // || el.data_type == "dt_timestamp"
              !Object.keys(dataSource.filtering).includes(variable) &&
              (dataSource.metadata.variables.required_vars.includes(variable) ||
                dataSource.metadata.variables.added_vars.includes(variable)),
          )
          .concat("t")
          .map(
            (variable) =>
              ({
                variable:
                  dataSource.metadata.variables.by_id[variable].variable,
                alias: dataSource.metadata.variables.by_id[variable].alias,
              }) as FilteringOption,
          )}
        getOptionLabel={(option) =>
          option.alias ? option.alias : option.variable
        }
        size="small"
        fullWidth
        onChange={(event: SyntheticEvent, option: FilteringOption | null) => {
          if (option) {
            if (data.byID[dataSource.internal_id].bounds) {
              setFilter(
                dataSource.internal_id,
                option.variable,
                data.byID[dataSource.internal_id].bounds[option.variable]!,
              );
            }
          }
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
        sx={{ mt: 1 }}
      />
      <Grid container direction="column" spacing={1} sx={{ mt: 1 }}>
        {Object.entries(dataSource.filtering).map(([variable, bounds]) => (
          <FilteringEditingRow
            key={"FilteringOption-" + variable + "-" + dataSource.internal_id}
            variable={variable}
            bounds={bounds}
            dataSource={dataSource}
          />
        ))}
      </Grid>
    </>
  );
}
