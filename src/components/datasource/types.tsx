import { Codec } from "@toolpad/core";
import { colormaps } from "../map/crameri-colormaps";
import { colormaps_categorical } from "../map/crameri-colormaps";

export type EarthQuake = {
  id: string;
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
  interface: { pickable: boolean; visible: boolean; addedVars: string[] };
  filtering: DataSourceFiltering;
  formatting: DataSourceFormatting;
  metadata: DataSourceMetaData;
};

export type DataSourceMetaData = {
  num_events: number;
  extent: Extent;
  data_headers: string[];
  data_descr: DataSourceDataDescription[];
};

export type DataSourceDataDescription = {
  variable: string;
  mapped_var: string[];
  alias: string;
  unit: string;
  data_type: "number" | "string" | "id_string" | "dt_string" | "dt_timestamp";
  bounds: [number, number];
  kde: [number[], number[]] | null;
  bins: [number[], number[]] | null;
  required: boolean;
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
  automatic: boolean;
  centroid: [number, number, number];
  bounds: [number, number, number, number];
  polygon: string;
};

export const DATASOURCE_JSON_CODEC: Codec<DataSource[]> = {
  parse: (raw: string) => JSON.parse(raw),
  stringify: (value: object) => JSON.stringify(value),
};

export const EXTENT_JSON_CODEC: Codec<Extent> = {
  parse: (raw: string) => JSON.parse(raw),
  stringify: (value: object) => JSON.stringify(value),
};
