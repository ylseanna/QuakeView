/* eslint-disable react-hooks/exhaustive-deps */
import DeckGL from "@deck.gl/react";
import { Box } from "@mui/material";
import { OrthographicView, PickingInfo, ScatterplotLayer } from "deck.gl";
import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

import TimelineSlider from "../interface/elements/timeline-slider";
import { useProjectStore } from "@/providers/project-store-provider";
import MapToolTip from "../map/map-tooltip";
import { useStemPlotLayers } from "../map/use-layers";
// import { fetchData } from "../datasource/load-data";
// import { useDataStore } from "@/providers/data-store-provider";
import { useCatalogData } from "../data/use-data";
import { Earthquake } from "../custom/types";
import { ControllerOptions } from "../map/types";
interface Bounds {
  x: [Date, Date];
  y: [number, number];
}
interface ViewPortBounds {
  pixel: { x: [number, number]; y: [number, number] };
  coord: { x: [Date, Date]; y: [number, number] };
}

interface ViewStateMonitor {
  pixelPosition: [number, number];
  coordPosition: [Date, number];
  zoom: [number, number];
}

export default function StemPlot() {
  return <TimelineSlider heightToWidthRatio={0.2} />;
}
