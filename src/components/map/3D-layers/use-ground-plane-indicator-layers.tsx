"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useMemo } from "react";
import "@deck.gl/widgets/stylesheet.css";
import { useProjectStore } from "@/providers/project-store-provider";
import { LayerExtension, LineLayer, LineLayerProps, PolygonLayer, TextLayer } from "deck.gl";
import { useAppStateStore } from "@/providers/app-state-provider";
import { useExtents } from "../use-extents";
import { useTheme } from "@mui/material/styles";
import { color, RGBColor, ticks } from "d3";

class FixedSizeExtension extends LayerExtension {
  getShaders() {
    return {
      inject: {
        'vs:DECKGL_FILTER_SIZE': 'size *= 0.7 * gl_Position.w;'
      }
    };
  }
}

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

  // depth indicators
  const groundPlaneIndicatorLayers = useMemo(() => {
    if (groundPlaneIndicatorsVisible) {
      let layers_to_set = [] as (LineLayer | TextLayer | PolygonLayer)[];

      const main3Dextents = extents["main"] as
        | [number, number, number, number, number, number]
        | null;

      if (main3Dextents) {
        const commonArgsLine = {
          data: main3Dextents,
          getColor: [127.5, 127.5, 127.5],
          opacity: textColor!.opacity,
          getWidth: 1,
          antialiasing: true,
        } as unknown as LineLayerProps;

        const commonArgsText = {
          data: main3Dextents,
          getColor: [textColor!.r, textColor!.g, textColor!.b],
          opacity: 0.1,
          getSize: 11,
          antialiasing: true,
          fontFamily: "Archivo Variable",
          fontWeight: "100",
          extensions: [new FixedSizeExtension()],
        } as unknown as LineLayerProps;

        // northern bottom bound
        layers_to_set.push(
          new LineLayer({
            ...commonArgsLine,
            id: "NBboundGP",
            getSourcePosition: [
              main3Dextents[0],
              main3Dextents[4],
              0,
            ],
            getTargetPosition: [
              main3Dextents[3],
              main3Dextents[4],
              0,
            ],
          }),
        );

        // eastern bottom bound
        layers_to_set.push(
          new LineLayer({
            ...commonArgsLine,
            id: "SBboundGP",
            getSourcePosition: [
              main3Dextents[3],
              main3Dextents[4],
              0,
            ],
            getTargetPosition: [
              main3Dextents[3],
              main3Dextents[1],
              0,
            ],
          }),
        );

        // southern bottom bound
        layers_to_set.push(
          new LineLayer({
            ...commonArgsLine,
            id: "EBboundGP",
            getSourcePosition: [
              main3Dextents[0],
              main3Dextents[1],
              0,
            ],
            getTargetPosition: [
              main3Dextents[3],
              main3Dextents[1],
              0,
            ],
          }),
        );

        // western bottom bound
        layers_to_set.push(
          new LineLayer({
            ...commonArgsLine,
            id: "WBboundGP",
            getSourcePosition: [
              main3Dextents[0],
              main3Dextents[4],
              0,
            ],
            getTargetPosition: [
              main3Dextents[0],
              main3Dextents[1],
              0,
            ],
          }),
        );

        // longitude ticks
        const xtickvalues = ticks(main3Dextents[0], main3Dextents[3], sessionInterface.threeD.threeDViewState.zoom > 8 ?  15 : 5);

        xtickvalues.forEach((xtickvalue) => {
          layers_to_set.push(
            new LineLayer({
              ...commonArgsLine,
              id: "xtickGroundPlane" + xtickvalue,
              getSourcePosition: [
                xtickvalue,
                main3Dextents[1],
                0,
              ],
              getTargetPosition: [
                xtickvalue,
                main3Dextents[4],
                0,
              ],
            }),
          );
        });

        // longitude ticks
        const ytickvalues = ticks(main3Dextents[1], main3Dextents[4], 15);

        ytickvalues.forEach((ytickvalue) => {
          layers_to_set.push(
            new LineLayer({
              ...commonArgsLine,
              id: "ytickGroundPlane" + ytickvalue,
              getSourcePosition: [
                main3Dextents[0],
                ytickvalue,
                0,
              ],
              getTargetPosition: [
                main3Dextents[3],
                ytickvalue,
                0,
              ],
            }),
          );
        });
      }

      return layers_to_set;
    } else {
      return [];
    }
  }, [
    // dataSources.allIDs,
    dataSources.byID,
    sessionInterface.threeD.threeDViewState.zoom,
    sessionInterface.threeD.threeDViewState.bearing,
    GPUfiltering,
    elevationOffset,
    groundPlaneIndicatorsVisible,
    textColor,
  ]);

  return groundPlaneIndicatorLayers;
}
