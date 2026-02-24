"use client";

import {
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
import { useProjectStore } from "@/providers/project-store-provider";

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

export default function GeneralFormattingForm({
  dataSource,
  type,
}: {
  dataSource: DataSource;
  type: "twoD" | "threeD" | "plot";
}) {
  const t = useTranslations("Formatting");

  // const { data } = useCatalogData();

  const setFormatting = useProjectStore(
    (state) => state.dataSourceActions.setFormatting,
  );

  return (
    <Grid container spacing={1} direction="column">
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
            value={dataSource.formatting[type].scale}
            min={1}
            max={500}
            onChange={(event, newValue) => {
              event.preventDefault();
              setFormatting(
                dataSource.internal_id,
                type,
                "scale",
                newValue as never,
              );
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
            value={dataSource.formatting[type].scale}
            size="small"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setFormatting(
                dataSource.internal_id,
                type,
                "scale",
                Number(event.target.value) as never,
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
            value={dataSource.formatting[type].opacity}
            min={0}
            max={100}
            onChange={(event: Event, newValue: number | number[]) => {
              event.preventDefault();
              setFormatting(
                dataSource.internal_id,
                type,
                "opacity",
                newValue as never,
              );
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
            value={dataSource.formatting[type].opacity}
            size="small"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setFormatting(
                dataSource.internal_id,
                type,
                "opacity",
                Number(event.target.value) as never,
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
            checked={dataSource.formatting[type].antialiasing}
            size="small"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setFormatting(
                dataSource.internal_id,
                type,
                "antialiasing",
                event.target.checked as never,
              );
            }}
            inputProps={{ "aria-label": "controlled" }}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
