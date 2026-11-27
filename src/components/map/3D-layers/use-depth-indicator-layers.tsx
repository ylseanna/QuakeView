"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useMemo } from "react";
import "@deck.gl/widgets/stylesheet.css";
import { useProjectStore } from "@/providers/project-store-provider";
import { LayerExtension, LineLayer, LineLayerProps, TextLayer } from "deck.gl";
import { useAppStateStore } from "@/providers/app-state-provider";
import { useExtents } from "../use-extents";
import linspace from "@stdlib/array-linspace";
import { useTheme } from "@mui/material/styles";
import { color, RGBColor } from "d3";

class FixedSizeExtension extends LayerExtension {
  getShaders() {
    return {
      inject: {
        "vs:DECKGL_FILTER_SIZE": "size *= 0.7 * gl_Position.w;",
      },
    };
  }
}

export function useDepthIndicatorLayers() {
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
  const depthIndicatorsVisible = useAppStateStore((state) => state.appInterface)
    .views.threeDDepthIndicatorsVisible;
  const geoExtentIndicatorsVisible = useAppStateStore(
    (state) => state.appInterface,
  ).views.threeDGeoExtentIndicatorsVisible;

  // get extents
  const extents = useExtents("threeD");

  // set color
  const textColor = color(theme.palette.text.secondary) as RGBColor;

  const heightSteps = useMemo(() => {
    const main3Dextents = extents["main"] as
      | [number, number, number, number, number, number]
      | null;

    if (main3Dextents) {
      return linspace(
        -Math.ceil(main3Dextents[5]),
        -Math.floor(main3Dextents[2]),
        Math.ceil(main3Dextents[5]) - Math.floor(main3Dextents[2] - 1),
      ).filter((el) =>
        sessionInterface.threeD.threeDViewState.zoom < 8
          ? el % 5 == 0
          : sessionInterface.threeD.threeDViewState.zoom < 9
            ? el % 2 == 0
            : true,
      );
    } else {
      return null;
    }
  }, [extents]);

  const axesLines = useCallback(
    (sourceIndices: [number, number], targetIndices: [number, number]) => {
      const main3Dextents = extents["main"] as
        | [number, number, number, number, number, number]
        | null;

      if (main3Dextents && heightSteps) {
        const axesLines = [] as { source: number[]; target: number[] }[];

        heightSteps.forEach((step) => {
          axesLines.push({
            source: [
              main3Dextents[sourceIndices[0]],
              main3Dextents[sourceIndices[1]],
              ((step as number) - elevationOffset) * 1000,
            ],
            target: [
              main3Dextents[targetIndices[0]],
              main3Dextents[targetIndices[1]],
              ((step as number) - elevationOffset) * 1000,
            ],
          });
        });

        return axesLines;
      } else {
        return [];
      }
    },
    [extents, heightSteps],
  );

  const textPositions = useCallback(
    (
      position: "northwest" | "northeast" | "southeast" | "southwest",
      exclude_bottom: boolean,
    ) => {
      const main3Dextents = extents["main"] as
        | [number, number, number, number, number, number]
        | null;

      if (main3Dextents && heightSteps) {
        const textPositions = [] as {
          step: number;
          coords: [number, number, number];
        }[];

        const indices =
          position == "northwest"
            ? [0, 4]
            : position == "northeast"
              ? [3, 4]
              : position == "southeast"
                ? [3, 1]
                : position == "southwest"
                  ? [0, 1]
                  : [0, 4];

        heightSteps.forEach((step) => {
          textPositions.push({
            coords: [
              main3Dextents[indices[0]],
              main3Dextents[indices[1]],
              ((step as number) - elevationOffset) * 1000,
            ],
            step: -step as number,
          });
        });

        if (!exclude_bottom) {
          return textPositions;
        } else {
          return textPositions.slice(1,);
        }
      } else {
        return [];
      }
    },
    [extents, heightSteps],
  );

  // depth indicators
  const depthIndicatorlayers = useMemo(() => {
    // if (depthIndicatorsVisible) {
    let layers_to_set = [] as (LineLayer | TextLayer)[];

    const commonArgsLine = {
      getColor: [127.5, 127.5, 127.5],
      opacity: 0.1,
      getWidth: 1,
      antialiasing: true,
    } as unknown as LineLayerProps;

    //   if (sessionInterface.map.showExtents) {
    if (heightSteps) {
      // North
      layers_to_set.push(
        new LineLayer({
          ...commonArgsLine,
          data: axesLines([0, 4], [3, 4]),
          id: "DepthTickLinesNorth",
          getSourcePosition: (line) => line.source,
          getTargetPosition: (line) => line.target,
          visible:
            Math.abs(sessionInterface.threeD.threeDViewState.bearing!) < 90 &&
            depthIndicatorsVisible,
        }),
      );

      // East
      layers_to_set.push(
        new LineLayer({
          ...commonArgsLine,
          data: axesLines([0, 1], [0, 4]),
          id: "DepthTickLinesEast",
          getSourcePosition: (line) => line.source,
          getTargetPosition: (line) => line.target,
          visible:
            sessionInterface.threeD.threeDViewState.bearing! < 0 &&
            depthIndicatorsVisible,
        }),
      );

      // South
      layers_to_set.push(
        new LineLayer({
          ...commonArgsLine,
          data: axesLines([0, 1], [3, 1]),
          id: "DepthTickLinesSouth",
          getSourcePosition: (line) => line.source,
          getTargetPosition: (line) => line.target,
          visible:
            Math.abs(sessionInterface.threeD.threeDViewState.bearing!) >= 90 &&
            depthIndicatorsVisible,
        }),
      );

      // West
      layers_to_set.push(
        new LineLayer({
          ...commonArgsLine,
          data: axesLines([3, 4], [3, 1]),
          id: "DepthTickLinesWest",
          getSourcePosition: (line) => line.source,
          getTargetPosition: (line) => line.target,
          visible:
            sessionInterface.threeD.threeDViewState.bearing! >= 0 &&
            depthIndicatorsVisible,
        }),
      );

      const commonArgsText = {
        getColor: [textColor!.r, textColor!.g, textColor!.b],
        opacity: textColor!.opacity,
        getSize: 11,
        antialiasing: true,
        fontFamily: "Archivo Variable",
        fontWeight: "100",
        extensions: [new FixedSizeExtension()],
      } as unknown as LineLayerProps;

      // left
      layers_to_set.push(
        new TextLayer({
          ...commonArgsText,
          data: textPositions(
            sessionInterface.threeD.threeDViewState.bearing! < -90
              ? "southeast"
              : sessionInterface.threeD.threeDViewState.bearing! < 0
                ? "southwest"
                : sessionInterface.threeD.threeDViewState.bearing! < 90
                  ? "northwest"
                  : "northeast",
            geoExtentIndicatorsVisible,
          ),
          id: "LeftText",
          getPosition: (position) => position.coords,
          getText: (position) => position.step.toString(),
          getTextAnchor: "end",
          getPixelOffset: [-8, 0],
          visible: depthIndicatorsVisible,
        }),
      );

      // right
      layers_to_set.push(
        new TextLayer({
          ...commonArgsText,
          data: textPositions(
            sessionInterface.threeD.threeDViewState.bearing! < -90
              ? "northwest"
              : sessionInterface.threeD.threeDViewState.bearing! < 0
                ? "northeast"
                : sessionInterface.threeD.threeDViewState.bearing! < 90
                  ? "southeast"
                  : "southwest",
            geoExtentIndicatorsVisible,
          ),
          id: "RightText",
          getPosition: (position) => position.coords,
          getText: (position) => position.step.toString(),
          getTextAnchor: "start",
          getPixelOffset: [8, 0],
          visible: depthIndicatorsVisible,
        }),
      );

      return layers_to_set;
    } else {
      return [];
    }
  }, [
    // dataSources.allIDs,
    extents,
    sessionInterface.threeD.threeDViewState.zoom,
    sessionInterface.threeD.threeDViewState.bearing,
    elevationOffset,
    depthIndicatorsVisible,
    textColor,
  ]);

  return depthIndicatorlayers;
}
