/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Autocomplete,
  Box,
  Checkbox,
  Divider,
  Grid,
  Input,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Slider,
  Switch,
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
import { ChangeEvent, SyntheticEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MuiColorInput } from "mui-color-input";
import HistogramSlider from "../../interface-elements/histogram-slider";
import { colormaps, colormaps_categorical } from "../../map/crameri-colormaps";
import { SwapHoriz } from "@mui/icons-material";

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

export default function DataSourceFormattingForm({
  dataSource,
  setFormatting,
}: {
  dataSource: DataSource;
  setFormatting: CallableFunction;
}) {
  const t = useTranslations("Formatting");

  const [localValues, setLocalValues] = useState<{
    localLinearDomain: [number, number];
    localLinearMin: number;
    localLinearMax: number;
  }>({
    localLinearDomain:
      dataSource.formatting.color.linear.domain[
        dataSource.formatting.color.linear.variable
      ],
    localLinearMin:
      dataSource.formatting.color.linear.domain[
        dataSource.formatting.color.linear.variable
      ][0],
    localLinearMax:
      dataSource.formatting.color.linear.domain[
        dataSource.formatting.color.linear.variable
      ][0],
  });

  useEffect(() => {
    setLocalValues({
      localLinearDomain:
        dataSource.formatting.color.linear.domain[
          dataSource.formatting.color.linear.variable
        ],
      localLinearMin:
        dataSource.formatting.color.linear.domain[
          dataSource.formatting.color.linear.variable
        ][0],
      localLinearMax:
        dataSource.formatting.color.linear.domain[
          dataSource.formatting.color.linear.variable
        ][0],
    });
  }, [setLocalValues, dataSource.formatting]);

  return (
    <>
      <Grid container spacing={1} direction="column" sx={{ mt: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={2.5}>
            <Tooltip
              title={t("scale_descr")}
              placement="left"
              slotProps={formToolTipSlotProps(10)}
            >
              <Typography variant="formlabel">{t("scale")}</Typography>
            </Tooltip>
          </Grid>
          <Grid
            size="grow"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Slider
              value={dataSource.formatting.scale}
              min={1}
              max={500}
              onChange={(event, newValue) => {
                event.preventDefault();
                setFormatting(dataSource.internal_id, "scale", newValue);
              }}
              aria-labelledby="input-slider"
              valueLabelDisplay="auto"
              size="small"
            />
          </Grid>
          <Grid
            size={2}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Input
              value={dataSource.formatting.scale}
              size="small"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setFormatting(
                  dataSource.internal_id,
                  "scale",
                  Number(event.target.value),
                );
              }}
              inputProps={{
                step: 0.1,
                min: 0,
                max: 500,
                type: "number",
                "aria-labelledby": "input-slider",
              }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={2.5}>
            <Tooltip
              title={t("opacity_descr")}
              placement="left"
              slotProps={formToolTipSlotProps(10)}
            >
              <Typography variant="formlabel">{t("opacity")}</Typography>
            </Tooltip>
          </Grid>
          <Grid
            size="grow"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Slider
              value={dataSource.formatting.opacity}
              min={0}
              max={100}
              onChange={(event: Event, newValue: number | number[]) => {
                event.preventDefault();
                setFormatting(dataSource.internal_id, "opacity", newValue);
              }}
              aria-labelledby="input-slider"
              valueLabelDisplay="auto"
              size="small"
            />
          </Grid>
          <Grid
            size={2}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Input
              value={dataSource.formatting.opacity}
              size="small"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setFormatting(
                  dataSource.internal_id,
                  "opacity",
                  Number(event.target.value),
                );
              }}
              inputProps={{
                step: 0.1,
                min: 0,
                max: 100,
                type: "number",
                "aria-labelledby": "input-slider",
              }}
            />
          </Grid>
        </Grid>
        <Grid container direction="row" sx={{ m: 0 }}>
          <Grid size={3}>
            <NoMaxWidthTooltip
              title={t("antialiasing_descr")}
              placement="left"
              slotProps={formToolTipSlotProps(10)}
            >
              <Typography noWrap variant="formlabel" component="span">
                {t("antialiasing")}
              </Typography>
            </NoMaxWidthTooltip>
          </Grid>
          <Grid>
            <Switch
              checked={dataSource.formatting.antialiasing}
              size="small"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setFormatting(
                  dataSource.internal_id,
                  "antialiasing",
                  event.target.checked,
                );
              }}
              inputProps={{ "aria-label": "controlled" }}
            />
          </Grid>
        </Grid>
      </Grid>
      <Divider sx={{ mt: 2, mb: 2 }} />
      <Grid container spacing={1} direction="column" sx={{ mt: 1 }}>
        <Typography variant="formheader">{t("colour")}</Typography>
        <Grid container alignItems="center">
          <Grid size="grow">
            <Typography variant="formlabel">{t("mapping")}</Typography>
          </Grid>

          <ToggleButtonGroup
            size="small"
            exclusive
            value={dataSource.formatting.color.mapping}
            onChange={(
              event: React.MouseEvent<HTMLElement>,
              newValue: string,
            ) => {
              if (newValue !== null) {
                setFormatting(dataSource.internal_id, "color", {
                  ...dataSource.formatting.color,
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
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Grid container direction="column" spacing={2}>
            {dataSource.formatting.color.mapping == "single" ? (
              <Grid container direction="row" alignItems="center" sx={{ m: 0 }}>
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
                    value={dataSource.formatting.color.single}
                    isAlphaHidden={true}
                    format="rgb"
                    fullWidth
                    onChange={(color: string) => {
                      setFormatting(dataSource.internal_id, "color", {
                        ...dataSource.formatting.color,
                        single: color,
                      });
                    }}
                  />
                </Grid>
              </Grid>
            ) : dataSource.formatting.color.mapping == "linear" ? (
              <Grid container direction="column">
                <Grid
                  container
                  direction="row"
                  alignItems="center"
                  sx={{ m: 0 }}
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
                      value={dataSource.formatting.color.linear.variable}
                      displayEmpty
                      inputProps={{ "aria-label": "Without label" }}
                      size="small"
                      fullWidth
                      onChange={(event: SelectChangeEvent) => {
                        setFormatting(dataSource.internal_id, "color", {
                          ...dataSource.formatting.color,
                          linear: {
                            ...dataSource.formatting.color.linear,
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
                  sx={{ m: 0 }}
                  spacing={1}
                >
                  <Grid size="grow">
                    <Autocomplete
                      value={dataSource.formatting.color.linear.cmap}
                      options={Object.keys(colormaps)}
                      autoHighlight
                      getOptionLabel={(option) => option}
                      size="small"
                      fullWidth
                      disableClearable
                      onChange={(event: SyntheticEvent, value) => {
                        console.log(value);
                        setFormatting(dataSource.internal_id, "color", {
                          ...dataSource.formatting.color,
                          linear: {
                            ...dataSource.formatting.color.linear,
                            cmap: value,
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
                    checked={dataSource.formatting.color.linear.inverted}
                    icon={<SwapHoriz />}
                    checkedIcon={<SwapHoriz />}
                    onChange={(event: SyntheticEvent, checked) => {
                      setFormatting(dataSource.internal_id, "color", {
                        ...dataSource.formatting.color,
                        linear: {
                          ...dataSource.formatting.color.linear,
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
                    variable={dataSource.formatting.color.linear.variable}
                    value={localValues.localLinearDomain}
                    min={
                      dataSource.metadata.variables.by_id[
                        dataSource.formatting.color.linear.variable
                      ].bounds[0]
                    }
                    max={
                      dataSource.metadata.variables.by_id[
                        dataSource.formatting.color.linear.variable
                      ].bounds[1]
                    }
                    onChange={(event: Event, newValue: number | number[]) => {
                      setLocalValues({
                        ...localValues,
                        localLinearDomain: newValue as [number, number],
                      });
                    }}
                    onChangeCommitted={(
                      event: Event | SyntheticEvent<Element, Event>,
                      newValue: number | number[],
                    ) => {
                      event.preventDefault();
                      console.log(newValue);
                      setFormatting(dataSource.internal_id, "color", {
                        ...dataSource.formatting.color,
                        linear: {
                          ...dataSource.formatting.color.linear,
                          domain: {
                            ...dataSource.formatting.color.linear.domain,
                            [dataSource.formatting.color.linear.variable]:
                              newValue,
                          },
                        },
                      });
                    }}
                  />
                  <Grid container sx={{ mt: 0.2 }}>
                    <Typography fontSize={14}>
                      {"Min: " +
                        Math.round(
                          dataSource.metadata.variables.by_id[
                            dataSource.formatting.color.linear.variable
                          ].bounds[0] * 100,
                        ) /
                          100}
                    </Typography>
                    <Grid size="grow"></Grid>
                    <Typography fontSize={14}>
                      {"Max: " +
                        Math.round(
                          dataSource.metadata.variables.by_id[
                            dataSource.formatting.color.linear.variable
                          ].bounds[1] * 100,
                        ) /
                          100}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            ) : dataSource.formatting.color.mapping == "categorical" ? (
              <Grid container direction="column">
                <Grid
                  container
                  direction="row"
                  alignItems="center"
                  sx={{ m: 0 }}
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
                      value={dataSource.formatting.color.categorical.variable}
                      displayEmpty
                      inputProps={{ "aria-label": "Without label" }}
                      size="small"
                      fullWidth
                      onChange={(event: SelectChangeEvent) => {
                        setFormatting(dataSource.internal_id, "color", {
                          ...dataSource.formatting.color,
                          categorical: {
                            ...dataSource.formatting.color.categorical,
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
                  sx={{ m: 0 }}
                  spacing={1}
                >
                  <Grid size="grow">
                    <Autocomplete
                      value={dataSource.formatting.color.categorical.cmap}
                      options={Object.keys(colormaps_categorical)}
                      autoHighlight
                      getOptionLabel={(option) => option}
                      size="small"
                      fullWidth
                      disableClearable
                      onChange={(event: SyntheticEvent, value) => {
                        console.log(value);
                        setFormatting(dataSource.internal_id, "color", {
                          ...dataSource.formatting.color,
                          categorical: {
                            ...dataSource.formatting.color.categorical,
                            cmap: value,
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
                    checked={dataSource.formatting.color.categorical.inverted}
                    icon={<SwapHoriz />}
                    checkedIcon={<SwapHoriz />}
                    onChange={(event: SyntheticEvent, checked) => {
                      setFormatting(dataSource.internal_id, "color", {
                        ...dataSource.formatting.color,
                        categorical: {
                          ...dataSource.formatting.color.categorical,
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
    </>
  );
}
