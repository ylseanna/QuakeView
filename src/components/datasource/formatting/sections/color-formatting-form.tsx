/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Autocomplete,
  Box,
  Checkbox,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { DataSource } from "@/components/datasource/types";
import { ChangeEvent, SyntheticEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { MuiColorInput, TinyColor } from "mui-color-input";
import HistogramSlider from "../../../interface-elements/histogram-slider";
import {
  colormaps,
  colormaps_categorical,
} from "../../../map/crameri-colormaps";
import { SwapHoriz } from "@mui/icons-material";
import { useProjectStore } from "@/providers/project-store-provider";
import{ useCatalogData } from "../../use-data";
import { Dayjs } from "dayjs";
import { PickerValue } from "@mui/x-date-pickers/internals";

const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: "none",
  },
});

const formToolTipSlotProps = (offset: number) => ({
  popper: {
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, offset],
        },
      },
    ],
  },
});

export default function ColorFormattingForm({
  dataSource,
  type,
}: {
  dataSource: DataSource;
  type: "twoD" | "threeD" | "plot";
}) {
  const t = useTranslations("Formatting");

  const { data } = useCatalogData();

  const setColorFormatting = useProjectStore(
    (state) => state.dataSourceActions.setColorFormatting,
  );

  const [localValues, setLocalValues] = useState<{
    localLinearDomain: [number, number];
    localLinearMin: number;
    localLinearMax: number;
  }>({
    localLinearDomain:
      dataSource.formatting[type].color.linear.domain[
        dataSource.formatting[type].color.linear.variable
      ]!,
    localLinearMin:
      dataSource.formatting[type].color.linear.domain[
        dataSource.formatting[type].color.linear.variable
      ]![0],
    localLinearMax:
      dataSource.formatting[type].color.linear.domain[
        dataSource.formatting[type].color.linear.variable
      ]![1],
  });

  return (
    data.allIDs.length > 0 && (
      <Grid container spacing={1} direction="column" sx={{ mt: 1 }}>
        <Typography variant="formheader">{t("colour")}</Typography>
        <Grid container alignItems="center">
          <Grid size="grow">
            <Typography variant="formlabel">{t("mapping")}</Typography>
          </Grid>

          <ToggleButtonGroup
            size="small"
            exclusive
            value={dataSource.formatting[type].color.mapping}
            onChange={(event: React.MouseEvent<HTMLElement>, newValue) => {
              if (newValue !== null) {
                setColorFormatting(dataSource.internal_id, type, {
                  ...dataSource.formatting[type].color,
                  mapping: newValue,
                });
              }
            }}
            sx={{ display: "flex", flex: "grow" }}
          >
            <ToggleButton value="single">{t("cmapping.single")}</ToggleButton>
            <ToggleButton value="linear">{t("cmapping.linear")}</ToggleButton>
            <ToggleButton value="categorical">
              {t("cmapping.categorical")}
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>

        <Paper variant="outlined" sx={{ p: 0 }}>
          <Grid container direction="column" spacing={2}>
            {dataSource.formatting[type].color.mapping == "single" ? (
              <Grid container direction="row" alignItems="center" sx={{ m: 2 }}>
                <Grid size={2}>
                  <NoMaxWidthTooltip
                    title={t("antialiasing_descr")}
                    placement="left"
                    slotProps={formToolTipSlotProps(10)}
                  >
                    <Typography noWrap variant="formlabel" component="span">
                      {t("color")}
                    </Typography>
                  </NoMaxWidthTooltip>
                </Grid>
                <Grid size="grow">
                  <MuiColorInput
                    size="small"
                    variant="outlined"
                    value={dataSource.formatting[type].color.single}
                    isAlphaHidden={true}
                    format="rgb"
                    fullWidth
                    onChange={(color) => {
                      setColorFormatting(dataSource.internal_id, type, {
                        ...dataSource.formatting[type].color,
                        single: color as unknown as TinyColor,
                      });
                    }}
                  />
                </Grid>
              </Grid>
            ) : dataSource.formatting[type].color.mapping == "linear" ? (
              <Grid container direction="column">
                <Grid
                  container
                  direction="row"
                  alignItems="center"
                  sx={{ mt: 2, mx: 2 }}
                >
                  <Grid size={3}>
                    <Tooltip
                      title={t("parameter_descr")}
                      placement="left"
                      slotProps={formToolTipSlotProps(26)}
                    >
                      <Typography noWrap variant="formlabel" component="span">
                        {t("parameter")}
                      </Typography>
                    </Tooltip>
                  </Grid>
                  <Divider sx={{ mt: 1, mb: 1 }} />
                  <Grid size="grow">
                    <Select
                      value={dataSource.formatting[type].color.linear.variable}
                      displayEmpty
                      inputProps={{ "aria-label": "Without label" }}
                      size="small"
                      fullWidth
                      onChange={(event: SelectChangeEvent) => {
                        setColorFormatting(dataSource.internal_id, type, {
                          ...dataSource.formatting[type].color,
                          linear: {
                            ...dataSource.formatting[type].color.linear,
                            variable: event.target.value,
                          },
                        });
                      }}
                    >
                      {dataSource.metadata.variables.required_vars
                        .concat(dataSource.metadata.variables.added_vars)
                        .map((variable: string) => {
                          const dataDescription =
                            dataSource.metadata.variables.by_id[variable];
                          if (
                            dataDescription.data_type == "number" ||
                            variable == "t"
                          ) {
                            return (
                              <MenuItem
                                key={`MenuItemVariable-${dataDescription.variable}`}
                                value={dataDescription.variable}
                              >
                                {dataDescription.alias
                                  ? dataDescription.alias
                                  : dataDescription.variable}
                              </MenuItem>
                            );
                          }
                        })}
                    </Select>
                  </Grid>
                </Grid>

                <Grid
                  container
                  direction="row"
                  alignItems="center"
                  sx={{ mx: 2 }}
                  spacing={1}
                >
                  <Grid size="grow">
                    <Autocomplete
                      value={dataSource.formatting[type].color.linear.cmap}
                      options={Object.keys(colormaps)}
                      autoHighlight
                      getOptionLabel={(option) => option}
                      size="small"
                      fullWidth
                      disableClearable
                      onChange={(event: SyntheticEvent, value) => {
                        console.log(value);
                        setColorFormatting(dataSource.internal_id, type, {
                          ...dataSource.formatting[type].color,
                          linear: {
                            ...dataSource.formatting[type].color.linear,
                            cmap: value as keyof typeof colormaps,
                          },
                        });
                      }}
                      renderOption={(props, cmap) => {
                        const { key, ...optionProps } = props;
                        return (
                          <Box
                            key={key}
                            className="NoClickAwayActionPanel"
                            sx={{
                              overflow: "hidden",
                              position: "relative",
                              display: "flex",
                              p: 0,
                              "& > img": {
                                position: "absolute",
                                zIndex: 0,
                                top: 0,
                                objectFit: "fill",
                              },
                            }}
                            component="li"
                            {...optionProps}
                          >
                            <Typography
                              className="NoClickAwayActionPanel"
                              sx={{
                                m: 1,
                                color: "#FFF",
                                zIndex: 1400,
                                position: "relative",
                              }}
                            >
                              {cmap}
                            </Typography>
                            <img
                              className="NoClickAwayActionPanel"
                              loading="lazy"
                              width="100%"
                              height="16px"
                              srcSet={`/images/cmap_previews/preview_${cmap}.png 2x`}
                              src={`/images/cmap_previews/preview_${cmap}.png`}
                              alt=""
                            />
                          </Box>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          slotProps={{
                            htmlInput: {
                              ...params.inputProps,
                              autoComplete: "new-password", // disable autocomplete and autofill
                            },
                          }}
                        />
                      )}
                    ></Autocomplete>
                  </Grid>
                  <Checkbox
                    checked={dataSource.formatting[type].color.linear.inverted}
                    icon={<SwapHoriz />}
                    checkedIcon={<SwapHoriz />}
                    onChange={(event: SyntheticEvent, checked) => {
                      setColorFormatting(dataSource.internal_id, type, {
                        ...dataSource.formatting[type].color,
                        linear: {
                          ...dataSource.formatting[type].color.linear,
                          inverted: checked,
                        },
                      });
                    }}
                  />
                </Grid>
                <Grid direction="column" alignItems="center" sx={{ m: 0 }}>
                  <HistogramSlider
                    id={`formatting-chart-${dataSource.internal_id}`}
                    dataSource={dataSource}
                    variable={dataSource.formatting[type].color.linear.variable}
                    value={localValues.localLinearDomain}
                    min={
                      data.byID[dataSource.internal_id].bounds[
                        dataSource.formatting[type].color.linear.variable
                      ]![0]
                    }
                    max={
                      data.byID[dataSource.internal_id].bounds[
                        dataSource.formatting[type].color.linear.variable
                      ]![1]
                    }
                    onChange={(event: Event, newValue: number | number[]) => {
                      setLocalValues({
                        ...localValues,
                        localLinearDomain: newValue as [number, number],
                      });
                    }}
                    onChangeCommitted={(
                      event: Event | SyntheticEvent<Element, Event>,
                      newValue,
                    ) => {
                      event.preventDefault();
                      console.log(newValue);
                      setColorFormatting(dataSource.internal_id, type, {
                        ...dataSource.formatting[type].color,
                        linear: {
                          ...dataSource.formatting[type].color.linear,
                          domain: {
                            ...dataSource.formatting[type].color.linear.domain,
                            [dataSource.formatting[type].color.linear.variable]:
                              newValue as [number, number],
                          },
                        },
                      });
                    }}
                    timeSlider={
                      dataSource.formatting[type].color.linear.variable == "t"
                    }
                    numberInputs
                    onChangeNumberInputsMin={(
                      event: ChangeEvent<HTMLInputElement>,
                    ) => {
                      setLocalValues({
                        ...localValues,
                        localLinearDomain: [
                          Number(event.target.value),
                          localValues.localLinearDomain[1],
                        ] as [number, number],
                      });
                    }}
                    onChangeDateTimeInputsMin={(value: PickerValue) => {
                      setLocalValues({
                        ...localValues,
                        localLinearDomain: [
                          (value as Dayjs)!.valueOf(),
                          localValues.localLinearDomain[1],
                        ] as [number, number],
                      });
                    }}
                    onAcceptDateTimeInputsMin={(value: PickerValue) => {
                      setColorFormatting(dataSource.internal_id, type, {
                        ...dataSource.formatting[type].color,
                        linear: {
                          ...dataSource.formatting[type].color.linear,
                          domain: {
                            ...dataSource.formatting[type].color.linear.domain,
                            [dataSource.formatting[type].color.linear.variable]:
                              [
                                (value as Dayjs)!.valueOf(),
                                localValues.localLinearDomain[1],
                              ] as [number, number],
                          },
                        },
                      });
                    }}
                    onChangeNumberInputsMax={(
                      event: ChangeEvent<HTMLInputElement>,
                    ) => {
                      setLocalValues({
                        ...localValues,
                        localLinearDomain: [
                          localValues.localLinearDomain[0],
                          Number(event.target.value),
                        ] as [number, number],
                      });
                    }}
                    onChangeDateTimeInputsMax={(value: PickerValue) => {
                      setLocalValues({
                        ...localValues,
                        localLinearDomain: [
                          localValues.localLinearDomain[0],
                          (value as Dayjs)!.valueOf(),
                        ] as [number, number],
                      });
                    }}
                    onAcceptDateTimeInputsMax={(value: PickerValue) => {
                      setColorFormatting(dataSource.internal_id, type, {
                        ...dataSource.formatting[type].color,
                        linear: {
                          ...dataSource.formatting[type].color.linear,
                          domain: {
                            ...dataSource.formatting[type].color.linear.domain,
                            [dataSource.formatting[type].color.linear.variable]:
                              [
                                localValues.localLinearDomain[0],
                                (value as Dayjs)!.valueOf(),
                              ] as [number, number],
                          },
                        },
                      });
                    }}
                    onBlurNumberInputs={() => {
                      setColorFormatting(dataSource.internal_id, type, {
                        ...dataSource.formatting[type].color,
                        linear: {
                          ...dataSource.formatting[type].color.linear,
                          domain: {
                            ...dataSource.formatting[type].color.linear.domain,
                            [dataSource.formatting[type].color.linear.variable]:
                              localValues.localLinearDomain as [number, number],
                          },
                        },
                      });
                    }}
                  />
                </Grid>
              </Grid>
            ) : dataSource.formatting[type].color.mapping == "categorical" ? (
              <Grid container direction="column">
                <Grid
                  container
                  direction="row"
                  alignItems="center"
                  sx={{ mt: 2, mx: 2 }}
                >
                  <Grid size={3}>
                    <Tooltip
                      title={t("parameter_descr")}
                      placement="left"
                      slotProps={formToolTipSlotProps(26)}
                    >
                      <Typography noWrap variant="formlabel" component="span">
                        {t("parameter")}
                      </Typography>
                    </Tooltip>
                  </Grid>
                  <Divider sx={{ mt: 1, mb: 1 }} />
                  <Grid size="grow">
                    <Select
                      value={
                        dataSource.formatting[type].color.categorical.variable
                      }
                      displayEmpty
                      inputProps={{ "aria-label": "Without label" }}
                      size="small"
                      fullWidth
                      onChange={(event: SelectChangeEvent) => {
                        setColorFormatting(dataSource.internal_id, type, {
                          ...dataSource.formatting[type].color,
                          categorical: {
                            ...dataSource.formatting[type].color.categorical,
                            variable: event.target.value,
                          },
                        });
                      }}
                    >
                      {dataSource.metadata.variables.required_vars
                        .concat(dataSource.metadata.variables.added_vars)
                        .map((variable: string) => {
                          const dataDescription =
                            dataSource.metadata.variables.by_id[variable];
                          if (dataDescription.data_type == "number") {
                            return (
                              <MenuItem
                                key={`MenuItemVariable-${dataDescription.variable}`}
                                value={dataDescription.variable}
                              >
                                {dataDescription.alias
                                  ? dataDescription.alias
                                  : dataDescription.variable}
                              </MenuItem>
                            );
                          }
                        })}
                    </Select>
                  </Grid>
                </Grid>

                <Grid
                  container
                  direction="row"
                  alignItems="center"
                  sx={{ mx: 2, mb: 2 }}
                  spacing={1}
                >
                  <Grid size="grow">
                    <Autocomplete
                      value={dataSource.formatting[type].color.categorical.cmap}
                      options={Object.keys(colormaps_categorical)}
                      autoHighlight
                      getOptionLabel={(option) => option}
                      size="small"
                      fullWidth
                      disableClearable
                      onChange={(event: SyntheticEvent, value) => {
                        console.log(value);
                        setColorFormatting(dataSource.internal_id, type, {
                          ...dataSource.formatting[type].color,
                          categorical: {
                            ...dataSource.formatting[type].color.categorical,
                            cmap: value as keyof typeof colormaps_categorical,
                          },
                        });
                      }}
                      renderOption={(props, cmap) => {
                        const { key, ...optionProps } = props;
                        return (
                          <Box
                            key={key}
                            className="NoClickAwayActionPanel"
                            sx={{
                              overflow: "hidden",
                              position: "relative",
                              display: "flex",
                              p: 0,
                              "& > img": {
                                position: "absolute",
                                zIndex: 0,
                                top: 0,
                                objectFit: "fill",
                              },
                            }}
                            component="li"
                            {...optionProps}
                          >
                            <Typography
                              className="NoClickAwayActionPanel"
                              sx={{
                                m: 1,
                                color: "#FFF",
                                zIndex: 1400,
                                position: "relative",
                              }}
                            >
                              {cmap}
                            </Typography>
                            <img
                              className="NoClickAwayActionPanel"
                              loading="lazy"
                              width="100%"
                              height="16px"
                              srcSet={`/images/cmap_previews/preview_${cmap}.png 2x`}
                              src={`/images/cmap_previews/preview_${cmap}.png`}
                              alt=""
                            />
                          </Box>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          slotProps={{
                            htmlInput: {
                              ...params.inputProps,
                              autoComplete: "new-password", // disable autocomplete and autofill
                            },
                          }}
                        />
                      )}
                    ></Autocomplete>
                  </Grid>
                  <Checkbox
                    checked={
                      dataSource.formatting[type].color.categorical.inverted
                    }
                    icon={<SwapHoriz />}
                    checkedIcon={<SwapHoriz />}
                    onChange={(event: SyntheticEvent, checked) => {
                      setColorFormatting(dataSource.internal_id, type, {
                        ...dataSource.formatting[type].color,
                        categorical: {
                          ...dataSource.formatting[type].color.categorical,
                          inverted: checked,
                        },
                      });
                    }}
                  />
                </Grid>
              </Grid>
            ) : (
              ""
            )}
          </Grid>
        </Paper>
      </Grid>
    )
  );
}
