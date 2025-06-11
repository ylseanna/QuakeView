import { MapViewState } from "@deck.gl/core";
import { Codec } from "@toolpad/core";
import { ViewState } from "react-map-gl";

export const VIEWSTATE_JSON_CODEC: Codec<ViewState> = {
  parse: (raw: string) => JSON.parse(raw),
  stringify: (value: object) => JSON.stringify(value),
};

export const ThreeD_VIEWSTATE_JSON_CODEC: Codec<MapViewState> = {
  parse: (raw: string) => JSON.parse(raw),
  stringify: (value: object) => JSON.stringify(value),
};