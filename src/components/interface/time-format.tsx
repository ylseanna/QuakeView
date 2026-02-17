import * as d3 from "d3";

const formatMillisecond = d3.utcFormat("%H:%M:%S.%L") as (
    domainValue: Date | d3.NumberValue,
    index: number,
  ) => string,
  formatSecond = d3.utcFormat("%H:%M:%S") as (
    domainValue: Date | d3.NumberValue,
    index: number,
  ) => string,
  formatMinute = d3.utcFormat("%H:%M") as (
    domainValue: Date | d3.NumberValue,
    index: number,
  ) => string,
  formatHour = d3.utcFormat("%H:%M") as (
    domainValue: Date | d3.NumberValue,
    index: number,
  ) => string,
  formatDayHour = d3.utcFormat("%d %H:%M") as (
    domainValue: Date | d3.NumberValue,
    index: number,
  ) => string,
  formatDay = d3.utcFormat("%d") as (
    domainValue: Date | d3.NumberValue,
    index: number,
  ) => string,
  formatMonth = d3.utcFormat("%Y-%m-%d") as (
    domainValue: Date | d3.NumberValue,
    index: number,
  ) => string,
  formatYear = d3.utcFormat("%Y") as (
    domainValue: Date | d3.NumberValue,
    index: number,
  ) => string;

export function minorTimeFormat(dateIntervalSeconds: number) {
  return dateIntervalSeconds < 1
    ? formatMillisecond
    : dateIntervalSeconds < 60
      ? formatSecond
      : dateIntervalSeconds < 60 * 60
        ? formatMinute
        : dateIntervalSeconds < 24 * 60 * 60
          ? formatHour
          : dateIntervalSeconds < 7 * 24 * 60 * 60
            ? formatDayHour
            : dateIntervalSeconds < 31 * 24 * 60 * 60
              ? formatDay
              : dateIntervalSeconds < 5 * 365.25 * 24 * 60 * 60
                ? formatMonth
                : formatYear;
}
