import { TinyColor } from "mui-color-input";

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
  formatting: {
    twoD: DataSourceFormatting;
    threeD: DataSourceFormatting;
    plot: DataSourceFormatting;
  };
  metadata: DataSourceMetaData;
};

export type DataSourceMetaData = {
  num_events: number;
  sep: string;
  index: "from_file" | "numerical";
  datetime_format:
    | "parseable_datetime_string"
    | "date_string-time_string"
    | "year-month-day-hour-minute-second";
  preview: { parsed: { [key: string]: number | string }[]; raw: string[] };
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
  single: TinyColor;
  linear: {
    variable: string;
    cmap: keyof typeof colormaps;
    inverted: boolean;
    domain: { [variable: string]: [number, number] | null };
  };
  categorical: {
    variable: string;
    cmap: keyof typeof colormaps_categorical;
    inverted: boolean;
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
