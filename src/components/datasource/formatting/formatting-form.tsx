"use client";

import {
  Divider,
  Grid,
  Input,
  Slider,
  Switch,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { DataSource } from "@/components/datasource/types";
import { ChangeEvent } from "react";
import { useTranslations } from "next-intl";

import ColorFormattingForm from "./color-formatting-form";

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
      <ColorFormattingForm dataSource={dataSource} />
    </>
  );
}
