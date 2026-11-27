"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useMemo } from "react";
import "@deck.gl/widgets/stylesheet.css";
import { useProjectStore } from "@/providers/project-store-provider";
import {
  LayerExtension,
  LineLayer,
  LineLayerProps,
  PolygonLayer,
  TextLayer,
} from "deck.gl";
import { useAppStateStore } from "@/providers/app-state-provider";
import { useExtents } from "../use-extents";
import { useTheme } from "@mui/material/styles";
import { color, RGBColor, text, ticks } from "d3";

export function useGroundPlaneIndicatorLayers() {
  // theme info
  const theme = useTheme();

  // access stores
  /// broad
  const { dataSources, GPUfiltering, sessionInterface } = useProjectStore(
    (state) => state,
  );
  /// targeted
  const { elevationOffset } = useProjectStore(
    (state) => state.sessionInterface.threeD,
  );
  const groundPlaneIndicatorsVisible = useAppStateStore(
    (state) => state.appInterface,
  ).views.threeDGroundPlaneIndicatorsVisible;

  // get extents
  const extents = useExtents("threeD");

  const textColor = color(theme.palette.text.secondary) as RGBColor;

  const bgColor = color("rgba(255, 255, 255, 0.439)") as RGBColor;

  // depth indicators
  const groundPlaneIndicatorLayers = useMemo(() => {
    let layers_to_set = [] as (LineLayer | TextLayer | PolygonLayer)[];

    const main3Dextents = extents["main"] as
      | [number, number, number, number, number, number]
      | null;

    if (main3Dextents) {
      const commonArgsLine = {
        getColor: [127.5, 127.5, 127.5],
        opacity: textColor!.opacity,
        getWidth: 1,
        antialiasing: true,
      } as unknown as LineLayerProps;


      const commonArgsPolygon = {
        stroked: true,
        getLineColor: [textColor!.r, textColor!.g, textColor!.b, textColor!.opacity * 255],
        getFillColor: [bgColor!.r, bgColor!.g, bgColor!.b, bgColor!.opacity * 255],
        lineWidthUnits: "pixels",
        getLineWidth: 1,
        antialiasing: true,
      } as unknown as LineLayerProps;

      // polygon
      layers_to_set.push(
        new PolygonLayer({
          ...commonArgsPolygon,
          data: [[
            main3Dextents[0],
            main3Dextents[4],
            0,
            main3Dextents[3],
            main3Dextents[4],
            0,
            main3Dextents[3],
            main3Dextents[1],
            0,
            main3Dextents[0],
            main3Dextents[1],
            0,
            main3Dextents[0],
            main3Dextents[4],
            0,
          ]],
          id: "PlaneGP",
          getPolygon: data => data,
          visible: groundPlaneIndicatorsVisible,
        }),
      );

      // longitude ticks
      const xtickvalues = ticks(
        main3Dextents[0],
        main3Dextents[3],
        sessionInterface.threeD.threeDViewState.zoom > 8 ? 15 : 5,
      );

      layers_to_set.push(
        new LineLayer({
          ...commonArgsLine,
          data: xtickvalues,
          id: "xticksGroundPlane",
          getSourcePosition: (xtickvalue) => [xtickvalue, main3Dextents[1], 0],
          getTargetPosition: (xtickvalue) => [xtickvalue, main3Dextents[4], 0],
          visible: groundPlaneIndicatorsVisible,
        }),
      );

      // longitude ticks
      const ytickvalues = ticks(main3Dextents[1], main3Dextents[4], 15);

      layers_to_set.push(
        new LineLayer({
          ...commonArgsLine,
          data: ytickvalues,
          id: "yticksGroundPlane",
          getSourcePosition: (ytickvalue) => [main3Dextents[0], ytickvalue, 0],
          getTargetPosition: (ytickvalue) => [main3Dextents[3], ytickvalue, 0],
          visible: groundPlaneIndicatorsVisible,
        }),
      );

      return layers_to_set;
    } else {
      return [];
    }
  }, [
    // dataSources.allIDs,
    dataSources.byID,
    sessionInterface.threeD.threeDViewState.zoom,
    sessionInterface.threeD.threeDViewState.bearing,
    elevationOffset,
    groundPlaneIndicatorsVisible,
    textColor,
    bgColor,
  ]);

  return groundPlaneIndicatorLayers;
}
