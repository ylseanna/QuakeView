export const DefaultVariableMappings = {
  // ALWAYS COPY TO BACKEND
  id: ["EventID", "evid"],
  dt: ["DT", "datetime", "Datetime"],
  lon: ["X", "lon", "Longitude"],
  lat: ["Y", "lat", "Latitude"],
  dep: ["Z", "dep", "Depth"],
  mag: ["ML", "mag", "Magnitude"],
};

export const dateTimeStringRequiredVars = [
  "id",
  "dt",
  "lon",
  "lat",
  "dep",
  "mag",
];

export const datePlusTimeStringRequiredVars = [
  "id",
  "date",
  "time",
  "lon",
  "lat",
  "dep",
  "mag",
];

export const dateTimeAsNumbersRequiredVars = [
  "id",
  "year",
  "month",
  "day",
  "hour",
  "minute",
  "second",
  "lon",
  "lat",
  "dep",
  "mag",
];
