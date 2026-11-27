"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useMemo } from "react";
import "@deck.gl/widgets/stylesheet.css";
import { useProjectStore } from "@/providers/project-store-provider";
import { LineLayer, LineLayerProps, TextLayer } from "deck.gl";
import { useAppStateStore } from "@/providers/app-state-provider";
import { useExtents } from "../use-extents";
import { useTheme } from "@mui/material/styles";
import { color, RGBColor } from "d3";

export function useFullExtentIndicatorLayers() {
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
  const fullExtentIndicatorsVisible = useAppStateStore(
    (state) => state.appInterface,
  ).views.threeDFullExtentIndicatorsVisible;

  // get extents
  const extents = useExtents("threeD");

  const textColor = color(theme.palette.text.secondary) as RGBColor;

  // depth indicators
  const fullExtentIndicatorLayers = useMemo(() => {
    if (fullExtentIndicatorsVisible) {
      let layers_to_set = [] as (LineLayer | TextLayer)[];

      const main3Dextents = extents["main"] as
        | [number, number, number, number, number, number]
        | null;

      // if (sessionInterface.map.showExtents) {
      if (main3Dextents) {
        const commonArgsLine = {
          data: main3Dextents,
          getColor: [textColor!.r, textColor!.g, textColor!.b],
          opacity: textColor!.opacity,
          getWidth: 1,
          antialiasing: true,
        } as unknown as LineLayerProps;

        const boundPositions = [
          {
            // northern top bound
            source: [
              main3Dextents[0],
              main3Dextents[4],
              (-main3Dextents[2] - elevationOffset) * 1000,
            ],
            target: [
              main3Dextents[3],
              main3Dextents[4],
              (-main3Dextents[2] - elevationOffset) * 1000,
            ],
          },
          {
            // eastern top bound
            source: [
              main3Dextents[3],
              main3Dextents[4],
              (-main3Dextents[2] - elevationOffset) * 1000,
            ],
            target: [
              main3Dextents[3],
              main3Dextents[1],
              (-main3Dextents[2] - elevationOffset) * 1000,
            ],
          },
          {
            // southern top bound
            source: [
              main3Dextents[3],
              main3Dextents[1],
              (-main3Dextents[2] - elevationOffset) * 1000,
            ],
            target: [
              main3Dextents[0],
              main3Dextents[1],
              (-main3Dextents[2] - elevationOffset) * 1000,
            ],
          },
          {
            // western top bound
            source: [
              main3Dextents[0],
              main3Dextents[4],
              (-main3Dextents[2] - elevationOffset) * 1000,
            ],
            target: [
              main3Dextents[0],
              main3Dextents[1],
              (-main3Dextents[2] - elevationOffset) * 1000,
            ],
          },
          {
            // northern bottom bound
            source: [
              main3Dextents[0],
              main3Dextents[4],
              (-main3Dextents[5] - elevationOffset) * 1000,
            ],
            target: [
              main3Dextents[3],
              main3Dextents[4],
              (-main3Dextents[5] - elevationOffset) * 1000,
            ],
          },
          {
            // eastern bottom bound
            source: [
              main3Dextents[3],
              main3Dextents[4],
              (-main3Dextents[5] - elevationOffset) * 1000,
            ],
            target: [
              main3Dextents[3],
              main3Dextents[1],
              (-main3Dextents[5] - elevationOffset) * 1000,
            ],
          },
          {
            // southern bottom bound
            source: [
              main3Dextents[3],
              main3Dextents[1],
              (-main3Dextents[5] - elevationOffset) * 1000,
            ],
            target: [
              main3Dextents[0],
              main3Dextents[1],
              (-main3Dextents[5] - elevationOffset) * 1000,
            ],
          },
          {
            // western bottom bound
            source: [
              main3Dextents[0],
              main3Dextents[4],
              (-main3Dextents[5] - elevationOffset) * 1000,
            ],
            target: [
              main3Dextents[0],
              main3Dextents[1],
              (-main3Dextents[5] - elevationOffset) * 1000,
            ],
          },
          {
            // northwestern side bound
            source: [
              main3Dextents[0],
              main3Dextents[4],
              (-main3Dextents[2] - elevationOffset) * 1000,
            ],
            target: [
              main3Dextents[0],
              main3Dextents[4],
              (-main3Dextents[5] - elevationOffset) * 1000,
            ],
          },
          {
            // northeastern side bound
            source: [
              main3Dextents[3],
              main3Dextents[4],
              (-main3Dextents[2] - elevationOffset) * 1000,
            ],
            target: [
              main3Dextents[3],
              main3Dextents[4],
              (-main3Dextents[5] - elevationOffset) * 1000,
            ],
          },
          {
            // southeastern side bound
            source: [
              main3Dextents[3],
              main3Dextents[1],
              (-main3Dextents[2] - elevationOffset) * 1000,
            ],
            target: [
              main3Dextents[3],
              main3Dextents[1],
              (-main3Dextents[5] - elevationOffset) * 1000,
            ],
          },
          {
            // southwestern side bound
            source: [
              main3Dextents[0],
              main3Dextents[1],
              (-main3Dextents[2] - elevationOffset) * 1000,
            ],
            target: [
              main3Dextents[0],
              main3Dextents[1],
              (-main3Dextents[5] - elevationOffset) * 1000,
            ],
          },
        ];

        layers_to_set.push(
          new LineLayer({
            ...commonArgsLine,
            data: boundPositions,
            id: "Extent",
            getSourcePosition: (position) => position.source,
            getTargetPosition: (position) => position.target,
          }),
        );
      }

      return layers_to_set;
    } else {
      return [];
    }
  }, [
    // dataSources.allIDs,
    dataSources.byID,
    elevationOffset,
    fullExtentIndicatorsVisible,
    textColor,
  ]);

  return fullExtentIndicatorLayers;
}
