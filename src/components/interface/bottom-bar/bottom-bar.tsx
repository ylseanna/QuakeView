import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { Pause, PlayArrow } from "@mui/icons-material";
import { GradientHorizontal, Selection, SelectionOff, Speedometer } from "mdi-material-ui";
import { Box, Button, Checkbox, Collapse, Divider, IconButton, Input, MenuItem, Paper, Select, SelectChangeEvent, Slide, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { useTranslations } from "next-intl";
import dayjs from "dayjs";
import { ChangeEvent, RefObject, useEffect, useState } from "react";

import { useProjectStore } from "@/providers/project-store-provider";
import { useAppStateStore } from "@/providers/app-state-provider";
import { useCatalogData } from "@/components/data/use-data";

export const DRAWER_HEIGHT = 200;
export const BOTTOMBAR_HEIGHT = 48;

export default function BottomBar({
  parentRef,
}: {
  parentRef?: RefObject<HTMLElement>;
}) {
  const { data } = useCatalogData();

  const t = useTranslations();

  const { bottombarVisible, timelineBarVisible } = useAppStateStore(
    (state) => state.appInterface.views,
  );

  const GPU_filtering = useProjectStore((state) => state.GPUfiltering);

  const { toggleTimelineBarVisible } = useAppStateStore(
    (state) => state.appInterfaceActions.viewActions,
  );

  const [width, setwidth] = useState(0);
  const {
    enabled: animationEnabled,
    isPlaying,
    tapered,
    speed: animationSpeed,
  } = useProjectStore((state) => state.sessionInterface.animation.timeline);
  const {
    toggleEnabled: toggleAnimationEnabled,
    setIsPlaying,
    setTapered,
    setSpeed: setAnimationSpeed,
  } = useProjectStore((state) => state.interfaceActions.animation.timeline);

  useEffect(() => {
    if (parentRef) {
      const observer = new ResizeObserver((entries) => {
        setwidth(entries[0].contentRect.width);
      });
      observer.observe(parentRef.current);

      const parentRefCurrent = parentRef.current;

      return () => parentRefCurrent && observer.unobserve(parentRefCurrent);
    }
  }, [parentRef]);

  return (
    <>
      {bottombarVisible && (
        <Paper
          square
          variant="outlined"
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            position: "fixed",
            bottom: 0,
            justifyContent: "space-between",
            width: "100%",
            transform:
              timelineBarVisible && data
                ? `translateY(-${DRAWER_HEIGHT}px)`
                : "translateY(0)",
            transition: "transform.225s",
            borderBottomWidth: 0,
            zIndex: 1200,
            px: 1,
            height: BOTTOMBAR_HEIGHT,
          }}
        >
          <Stack
            direction="row"
            sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}
          >
            {" "}
            <Checkbox
              size="small"
              checked={animationEnabled}
              onChange={() => {
                if (!timelineBarVisible) {
                  if (!animationEnabled) {
                    toggleTimelineBarVisible();
                  }
                }
                toggleAnimationEnabled();
              }}
              icon={<SelectionOff />}
              checkedIcon={<Selection />}
            />{" "}
            <Divider
              orientation="vertical"
              sx={{ mx: 1, height: BOTTOMBAR_HEIGHT }}
              flexItem
            />
            <Stack
              direction="row"
              spacing={0.5}
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="formlabel" sx={{ px: 1 }}>
                {t("Bottombar.selection")}
              </Typography>
              <DateTimePicker
                readOnly
                value={dayjs(GPU_filtering.t![0])}
                // onChange={onChangeDateTimeInputsMin}
                // onAccept={onAcceptDateTimeInputsMin}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      "> .MuiOutlinedInput-root": {
                        height: "20px", // whatever height you want here
                      },
                      width: "200px",
                    },
                  },
                }}
                views={["year", "month", "day", "hours", "minutes", "seconds"]}
                format="YYYY-MM-DD HH:mm:ss"
                ampm={false}

                // label={t("Slider.selection_start_time")}
              />

              <DateTimePicker
                readOnly
                value={dayjs(GPU_filtering.t![1])}
                // onChange={onChangeDateTimeInputsMax}
                // onAccept={onAcceptDateTimeInputsMax}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      "> .MuiOutlinedInput-root": {
                        height: "20px", // whatever height you want here
                      },
                      width: "200px",
                    },
                  },
                  popper: { className: "NoClickAwayActionPanel" },
                  desktopPaper: { className: "NoClickAwayActionPanel" },
                }}
                views={["year", "month", "day", "hours", "minutes", "seconds"]}
                format="YYYY-MM-DD HH:mm:ss"
                ampm={false}
                // label={t("Slider.selection_end_time")}
              />
              <Divider
                orientation="vertical"
                sx={{ ml: 1, height: BOTTOMBAR_HEIGHT }}
                flexItem
              />
            </Stack>
            <Collapse orientation="horizontal" in={animationEnabled}>
              <Stack
                direction="row"
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(0, 0, 0, .02)",
                  pl: 1,
                }}
              >
                <Typography variant="formlabel" sx={{ px: 1 }}>
                  {t("Bottombar.animation")}
                </Typography>

                <IconButton
                  onClick={() => {
                    if (isPlaying == "stopped") {
                      setIsPlaying("playing");
                    } else {
                      setIsPlaying("stopped");
                    }
                  }}
                  size="small"
                >
                  {isPlaying == "stopped" ? <PlayArrow /> : <Pause />}
                </IconButton>
                <Divider orientation="vertical" sx={{ m: 1, mr: 1 }} flexItem />
                <Speedometer sx={{ mr: 1 }} />
                <Input
                  disableUnderline
                  value={animationSpeed.multiplier}
                  size="small"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setAnimationSpeed({
                      multiplier: Number(event.target.value),
                      unit: animationSpeed.unit,
                    });
                  }}
                  sx={{ width: 36, alignSelf: "end", mb: "1px" }}
                  inputProps={{
                    step: 1,
                    min: 0,
                    max: 100,
                    type: "number",
                    "aria-labelledby": "input-slider",
                  }}
                />
                <Select
                  labelId="demo-simple-select-autowidth-label"
                  id="demo-simple-select-autowidth"
                  value={animationSpeed.unit}
                  onChange={(event: SelectChangeEvent) => {
                    setAnimationSpeed({
                      multiplier: animationSpeed.multiplier,
                      unit: event.target.value as
                        | "second"
                        | "minute"
                        | "hour"
                        | "day"
                        | "week"
                        | "year",
                    });
                  }}
                  disableUnderline
                  autoWidth
                  label="Age"
                  size="small"
                  variant="standard"
                  sx={{
                    alignSelf: "end",
                    // mb: "2px",
                    // height: "34px!important",
                    // alignItems: "center",
                    // justifyContent: "center",
                  }}
                >
                  <MenuItem value="second">
                    {animationSpeed.multiplier != 1
                      ? t("Animation.seconds")
                      : t("Animation.second")}
                  </MenuItem>
                  <MenuItem value="minute">
                    {animationSpeed.multiplier != 1
                      ? t("Animation.minutes")
                      : t("Animation.minute")}
                  </MenuItem>
                  <MenuItem value="hour">
                    {animationSpeed.multiplier != 1
                      ? t("Animation.hours")
                      : t("Animation.hour")}
                  </MenuItem>
                  <MenuItem value="day">
                    {animationSpeed.multiplier != 1
                      ? t("Animation.days")
                      : t("Animation.day")}
                  </MenuItem>
                  <MenuItem value="week">
                    {animationSpeed.multiplier != 1
                      ? t("Animation.weeks")
                      : t("Animation.week")}
                  </MenuItem>
                  <MenuItem value="year">
                    {animationSpeed.multiplier != 1
                      ? t("Animation.years")
                      : t("Animation.year")}
                  </MenuItem>
                </Select>
                {" /s"}
                <Divider orientation="vertical" sx={{ m: 1, ml: 1 }} flexItem />
                <Checkbox
                  size="small"
                  checked={tapered}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setTapered(event.target.checked);
                  }}
                  icon={<GradientHorizontal />}
                  checkedIcon={<GradientHorizontal />}
                />
                <Divider
                  orientation="vertical"
                  sx={{ ml: 1, mr: 0.5, height: BOTTOMBAR_HEIGHT }}
                  flexItem
                />
              </Stack>
            </Collapse>
          </Stack>
          <Stack direction="row">
            <Divider
              orientation="vertical"
              sx={{ mx: 1, height: BOTTOMBAR_HEIGHT }}
              flexItem
            />
            <Tooltip
              title={
                timelineBarVisible == true ? "" : t("Formatting.formatting")
              }
              placement="top"
            >
              <Button onClick={toggleTimelineBarVisible}>
                {t("Common.timeline")}
              </Button>
            </Tooltip>
          </Stack>
        </Paper>
      )}
    </>
  );
}
