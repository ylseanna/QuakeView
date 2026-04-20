import * as d3 from "d3";

import { useAppStateStore } from "@/providers/app-state-provider";

export function minorTimeFormat(
  dateIntervalSeconds: number,
  dayFormat: "DayOfMonth" | "DayOfYear",
) {
  if (dayFormat == "DayOfMonth") {
    return dateIntervalSeconds < 10
      ? d3.utcFormat("%H:%M:%S.%L")
      : dateIntervalSeconds < 9 * 60
        ? d3.utcFormat("%H:%M:%S")
        : dateIntervalSeconds < 7 * 24 * 60 * 60
          ? d3.utcFormat("%H:%M")
          : dateIntervalSeconds < 3 * 31 * 24 * 60 * 60
            ? d3.utcFormat("%_d")
            : dateIntervalSeconds < 5 * 365.25 * 24 * 60 * 60
              ? d3.utcFormat("%_d %b")
              : d3.utcFormat("%Y");
  } else if (dayFormat == "DayOfYear") {
    return dateIntervalSeconds < 10
      ? d3.utcFormat("%H:%M:%S.%L")
      : dateIntervalSeconds < 9 * 60
        ? d3.utcFormat("%H:%M:%S")
        : dateIntervalSeconds < 7 * 24 * 60 * 60
          ? d3.utcFormat("%H:%M")
          : dateIntervalSeconds < 3 * 31 * 24 * 60 * 60
            ? d3.utcFormat("%j")
            : dateIntervalSeconds < 5 * 365.25 * 24 * 60 * 60
              ? d3.utcFormat("%j")
              : d3.utcFormat("%Y");
  }
}

export function majorTimeBoundaryLocator(dateIntervalSeconds: number) {
  return dateIntervalSeconds < 1
    ? d3.utcDay.every(1)
    : dateIntervalSeconds < 60
      ? d3.utcDay.every(1)
      : dateIntervalSeconds < 60 * 60
        ? d3.utcDay.every(1)
        : dateIntervalSeconds < 24 * 60 * 60
          ? d3.utcDay.every(1)
          : dateIntervalSeconds < 7 * 24 * 60 * 60
            ? d3.utcDay.every(1)
            : dateIntervalSeconds < 3 * 31 * 24 * 60 * 60
              ? d3.utcMonth.every(1)
              : dateIntervalSeconds < 5 * 365.25 * 24 * 60 * 60
                ? d3.utcYear.every(1)
                : [];
}

export function majorTickFormat(
  dateIntervalSeconds: number,
  dayFormat: "DayOfMonth" | "DayOfYear",
) {
  if (dayFormat == "DayOfMonth") {
    return dateIntervalSeconds < 1
      ? d3.utcFormat("%Y-%m-%d")
      : dateIntervalSeconds < 60
        ? d3.utcFormat("%Y-%m-%d")
        : dateIntervalSeconds < 60 * 60
          ? d3.utcFormat("%Y-%m-%d")
          : dateIntervalSeconds < 24 * 60 * 60
            ? d3.utcFormat("%Y-%m-%d")
            : dateIntervalSeconds < 7 * 24 * 60 * 60
              ? d3.utcFormat("%Y-%m-%d")
              : dateIntervalSeconds < 3 * 31 * 24 * 60 * 60
                ? d3.utcFormat("%b %Y")
                : dateIntervalSeconds < 5 * 365.25 * 24 * 60 * 60
                  ? d3.utcFormat("%Y")
                  : () => "Year";
  } else if (dayFormat == "DayOfYear") {
    return dateIntervalSeconds < 1
      ? d3.utcFormat("%Y, day %j")
      : dateIntervalSeconds < 60
        ? d3.utcFormat("%Y, day %j")
        : dateIntervalSeconds < 60 * 60
          ? d3.utcFormat("%Y, day %j")
          : dateIntervalSeconds < 24 * 60 * 60
            ? d3.utcFormat("%Y, day %j")
            : dateIntervalSeconds < 7 * 24 * 60 * 60
              ? d3.utcFormat("%Y, day %j")
              : dateIntervalSeconds < 3 * 31 * 24 * 60 * 60
                ? d3.utcFormat("%Y")
                : dateIntervalSeconds < 5 * 365.25 * 24 * 60 * 60
                  ? d3.utcFormat("%Y")
                  : () => "Year";
  }
}

const dateRangeMidpoints = (
  bounds: [Date, Date],
  d3TimeInterval: d3.TimeInterval,
) => {
  const startDates = [
    bounds[0],
    ...d3TimeInterval.range(bounds[0], bounds[1], 1)!,
  ];

  return startDates.map((startDate, index) =>
    startDates[index + 1]
      ? new Date((startDate.getTime() + startDates[index + 1].getTime()) / 2)
      : new Date((startDate.getTime() + bounds[1].getTime()) / 2),
  );
};

export function majorTickLocator(
  dateIntervalSeconds: number,
  bounds: [Date, Date],
) {
  return dateIntervalSeconds < 1
    ? dateRangeMidpoints(bounds, d3.utcDay.every(1)!)
    : dateIntervalSeconds < 60
      ? dateRangeMidpoints(bounds, d3.utcDay.every(1)!)
      : dateIntervalSeconds < 60 * 60
        ? dateRangeMidpoints(bounds, d3.utcDay.every(1)!)
        : dateIntervalSeconds < 24 * 60 * 60
          ? dateRangeMidpoints(bounds, d3.utcDay.every(1)!)
          : dateIntervalSeconds < 7 * 24 * 60 * 60
            ? dateRangeMidpoints(bounds, d3.utcDay.every(1)!)
            : dateIntervalSeconds < 3 * 31 * 24 * 60 * 60
              ? dateRangeMidpoints(bounds, d3.utcMonth.every(1)!)
              : dateIntervalSeconds < 5 * 365.25 * 24 * 60 * 60
                ? dateRangeMidpoints(bounds, d3.utcYear.every(1)!)
                : [new Date((bounds[1].getTime() + bounds[0].getTime()) / 2)];
}
