import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { PickerValue } from "@mui/x-date-pickers/internals";
import { Box, FormControl, Input, InputLabel, Skeleton, Slider, SliderOwnProps, Stack } from "@mui/material";
import { useTranslations } from "next-intl";
import dayjs from "dayjs";
import { ChangeEventHandler, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

import { useAppStateStore } from "@/providers/app-state-provider";
import { useData } from "../datasource/use-data";
import { DataSource, Earthquake } from "../datasource/types";

export default function HistogramSlider({
  id,
  dataSource,
  variable,
  value,
  min,
  max,
  timeSlider,
  marks,
  onChange,
  onChangeCommitted,
  numberInputs,
  onChangeNumberInputsMin,
  onChangeDateTimeInputsMin,
  onAcceptDateTimeInputsMin,

  onChangeNumberInputsMax,
  onChangeDateTimeInputsMax,
  onAcceptDateTimeInputsMax,
  onBlurNumberInputs,
}: {
  id?: string;
  dataSource: DataSource;
  variable: string;
  value: SliderOwnProps<[number, number]>["value"];
  min: SliderOwnProps<number>["max"];
  max: SliderOwnProps<number>["max"];
  timeSlider?: boolean;
  marks?: SliderOwnProps<number | number[]>["marks"];
  onChange: SliderOwnProps<number | number[]>["onChange"];
  onChangeCommitted: SliderOwnProps<number | number[]>["onChangeCommitted"];
  numberInputs?: boolean;
  onChangeNumberInputsMin?: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement,
    Element
  >;
  onChangeDateTimeInputsMin?: (value: PickerValue) => void;
  onAcceptDateTimeInputsMin?: (value: PickerValue) => void;
  onChangeNumberInputsMax?: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement,
    Element
  >;
  onChangeDateTimeInputsMax?: (value: PickerValue) => void;
  onAcceptDateTimeInputsMax?: (value: PickerValue) => void;
  onBlurNumberInputs?: () => void;
}) {
  const { data } = useData();

  const parentRef = useRef<HTMLInputElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const { signalPopperOpen, signalPopperClosed } = useAppStateStore(
    (state) => state.appInterfaceActions,
  );

  const step = Number((max! - min!).toPrecision(1)) / 100;

  useLayoutEffect(() => {
    if (parentRef.current) {
      setDimensions({
        width: parentRef.current.offsetWidth,
        height: parentRef.current.offsetHeight,
      });
    }
  }, []);

  // constants
  const margin = { top: 8, right: 16, bottom: 20, left: 16 },
    height_to_width_ration = 0.4;

  const width = useMemo(() => dimensions.width, [dimensions.width]);
  const height = useMemo(
    () => dimensions.width * height_to_width_ration,
    [dimensions.width],
  );

  const graphWidth = useMemo(
    () => width - margin.left - margin.right,
    [margin.left, margin.right, width],
  );
  const graphHeight = useMemo(
    () => height - margin.top - margin.bottom,
    [height, margin.bottom, margin.top],
  );

  useEffect(() => {
    d3.select(id ? "#" + id : `#chart-${dataSource.internal_id}`)
      .select("svg")
      .remove();
    // set the dimensions and margins of the graph

    // append the svg object to the body of the page
    const svg = d3
      .select(id ? "#" + id : `#chart-${dataSource.internal_id}`)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = timeSlider
      ? d3
          .scaleTime()
          .domain([
            new Date(min as number),
            new Date(max as number),
          ] as Iterable<d3.NumberValue>)
          .range([0, graphWidth])
      : d3
          .scaleLinear()
          .domain([min, max] as Iterable<d3.NumberValue>)
          .range([0, graphWidth]);

    const xAxes = svg
      .append("g")
      .attr("transform", `translate(0, ${graphHeight})`)
      .call(
        d3.axisBottom(x).ticks(5),
        // .tickFormat(() => "")
      );

    // d3.json(dataSourceDataUrl(dataSource)).then((data) => {
    //   if (!data) {
    //     console.log("no data");
    //   } else {
    if (data.byID[dataSource.internal_id]) {
      const bins = d3.bin().thresholds(50).domain([min!, max!])(
        (data.byID[dataSource.internal_id].data as Earthquake[]).map(
          (d) => d[variable],
        ) as ArrayLike<number>,
      );

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(bins, (d) => d.length)] as Iterable<d3.NumberValue>)
        .range([graphHeight, margin.top]);

      svg
        .append("g")
        .selectAll()
        .data(bins)
        .join("rect")
        .attr("x", (d) => x(d.x0!))
        .attr("width", (d) => x(d.x1!) - x(d.x0!))
        .attr("y", (d) => y(d.length))
        .attr("height", (d) => y(0) - y(d.length))
        .attr("fill", "var(--mui-palette-text-primary)")
        .attr("fill-opacity", 0.4);

      xAxes.selectAll("line").attr("stroke-opacity", 0.6);
      xAxes.selectAll("path").remove();
      // }
      setIsLoading(false);
    }
    //   // X axis
    // });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dataSource.internal_id,
    id,
    dataSource.filename,
    min,
    max,
    step,
    dimensions,
    data,
  ]);

  const t = useTranslations();

  return (
    <Box>
      <div style={{ position: "relative" }}>
        <div
          ref={parentRef}
          id={id ? id : `chart-${dataSource.internal_id}`}
          style={{ position: "relative" }}
        >
          {isLoading && (
            <Skeleton
              sx={{ position: "absolute", top: margin.top, left: margin.left }}
              variant="rectangular"
              width={graphWidth}
              height={graphHeight}
            />
          )}
        </div>

        <Slider
          value={value}
          // valueLabelDisplay="auto"
          min={min}
          max={max}
          step={step}
          marks={marks}
          onChange={onChange}
          size="small"
          onChangeCommitted={onChangeCommitted}
          valueLabelFormat={
            timeSlider ? (value) => new Date(value).toISOString() : undefined
          }
          sx={{
            position: "absolute",
            bottom: 7,
            left: margin.left,
            width: graphWidth,
          }}
        />
      </div>
      <Box sx={{ m: 2 }}>
        {numberInputs && timeSlider ? (
          <Stack direction="column" spacing={2} justifyContent="space-between">
            <DateTimePicker
              value={dayjs(value![0])}
              onChange={onChangeDateTimeInputsMin}
              onAccept={onAcceptDateTimeInputsMin}
              onOpen={signalPopperOpen}
              onClose={signalPopperClosed}
              slotProps={{
                textField: {
                  size: "small",
                },
              }}
              views={["year", "month", "day", "hours", "minutes", "seconds"]}
              format="YYYY-MM-DD HH:mm:ss"
              ampm={false}
              label={t("Slider.start_time")}
            />

            <DateTimePicker
              value={dayjs(value![1])}
              onChange={onChangeDateTimeInputsMax}
              onAccept={onAcceptDateTimeInputsMax}
              onOpen={signalPopperOpen}
              onClose={signalPopperClosed}
              slotProps={{
                textField: {
                  size: "small",
                },
                popper: { className: "NoClickAwayActionPanel" },
                desktopPaper: { className: "NoClickAwayActionPanel" },
              }}
              views={["year", "month", "day", "hours", "minutes", "seconds"]}
              format="YYYY-MM-DD HH:mm:ss"
              ampm={false}
              label={t("Slider.end_time")}
            />
          </Stack>
        ) : (
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <FormControl fullWidth variant="standard">
              <InputLabel sx={{ top: "6px" }}>Minimum</InputLabel>
              <Input
                value={value![0]}
                size="small"
                onChange={onChangeNumberInputsMin}
                onBlur={onBlurNumberInputs}
                sx={{ width: "100%" }}
                inputProps={{
                  step: step,
                  min: min,
                  max: max,
                  type: "number",
                  "aria-labelledby": "input-slider",
                }}
                onKeyUp={(event) => {
                  if (event.key === "Enter") {
                    onBlurNumberInputs!();
                  }
                }}
              />
            </FormControl>
            <FormControl fullWidth variant="standard">
              <InputLabel sx={{ top: "6px" }}>Maximum</InputLabel>
              <Input
                value={value![1]}
                size="small"
                onChange={onChangeNumberInputsMax}
                onBlur={onBlurNumberInputs}
                sx={{ width: "100%" }}
                inputProps={{
                  step: step,
                  min: min,
                  max: max,
                  type: "number",
                  "aria-labelledby": "input-slider",
                }}
                onKeyUp={(event) => {
                  if (event.key === "Enter") {
                    onBlurNumberInputs!();
                  }
                }}
              />
            </FormControl>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
