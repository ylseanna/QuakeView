import { colormaps } from "../map/crameri-colormaps";
import { colormaps_categorical } from "../map/crameri-colormaps";

export type EarthQuake = {
  id: string;
  dt: string;
  t: number;
  mag: number;
  dep: number;
  lon: number;
  lat: number;
  [key: string]: number | string;
};

export type DataSource = {
  internal_id: string;
  filename: string;
  filepath: string;
  name: string;
  interface: { pickable: boolean; visible: boolean; loadable: boolean };
  filtering: DataSourceFiltering;
  formatting: DataSourceFormatting;
  metadata: DataSourceMetaData;
};

export type DataSourceMetaData = {
  num_events: number;
  // extent: Extent;
  sep: string;
  datetime_format: "parseable_datetime_string" | "year-month-day-hour-minute-second";
  preview: { parsed: { [key: string]: number | string }[], raw: string[] };
  catalog_headers: string[];
  variables: {
    by_id: { [variable: string]: DataSourceDataDescription };
    required_vars: string[];
    datetime_vars: string[];
    optional_vars: string[];
    added_vars: string[];
  };
};

export type DataSourceDataDescription = {
  variable: string;
  mapped_var: string[];
  alias: string;
  unit: string;
  data_type: "number" | "string" | "id_string" | "dt_string" | "dt_timestamp";
};

export type DataSourceFiltering = {
  [variable: string]: [number, number];
};

export type DataSourceFormatting = {
  scale: number;
  opacity: number;
  antialiasing: boolean;
  positionOffset: number;
  color: DataSourceColorFormatting;
};

export type DataSourceColorFormatting = {
  mapping: "single" | "linear" | "categorical" | "custom";
  single: "rgb(0, 0, 0)";
  linear: {
    variable: string;
    cmap: keyof typeof colormaps;
    inverted: false;
    domain: { [variable: string]: [number, number] };
  };
  categorical: {
    variable: string;
    cmap: keyof typeof colormaps_categorical;
    inverted: false;
  };
};

export type Extent = {
  centroid: [number, number, number];
  bounds: [number, number, number, number];
  polygon: string;
};

// export const DATASOURCE_JSON_CODEC: Codec<DataSource[]> = {
//   parse: (raw: string) => JSON.parse(raw),
//   stringify: (value: object) => JSON.stringify(value),
// };

// export const EXTENT_JSON_CODEC: Codec<Extent> = {
//   parse: (raw: string) => JSON.parse(raw),
//   stringify: (value: object) => JSON.stringify(value),
// };
