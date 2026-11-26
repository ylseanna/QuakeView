"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useMemo } from "react";
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
        'vs:DECKGL_FILTER_SIZE': 'size *= 0.7 * gl_Position.w;'
      }
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

  // get extents
  const extents = useExtents("threeD");

  // set color
  const textColor = color(theme.palette.text.secondary) as RGBColor;

  // depth indicators
  const depthIndicatorlayers = useMemo(() => {
    if (depthIndicatorsVisible) {
      let layers_to_set = [] as (LineLayer | TextLayer)[];

      const main3Dextents = extents["main"] as
        | [number, number, number, number, number, number]
        | null;

      if (sessionInterface.map.showExtents) {
        if (main3Dextents) {
          const heightSteps = linspace(
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

          const commonArgsLine = {
            data: main3Dextents,
            getColor: [127.5, 127.5, 127.5],
            opacity: 0.1,
            getWidth: 1,
            antialiasing: true,
          } as unknown as LineLayerProps;

          const commonArgsText = {
            data: main3Dextents,
            getColor: [textColor!.r, textColor!.g, textColor!.b],
            opacity: .1,
            getSize: 11,
            antialiasing: true,
            fontFamily: "Archivo Variable",
            fontWeight: "100",
            extensions: [new FixedSizeExtension()],
          } as unknown as LineLayerProps;

          heightSteps.forEach((step) => {
            // northwestern bound
            layers_to_set.push(
              new TextLayer({
                ...commonArgsText,
                id:
                  "NWtext" +
                  step +
                  (sessionInterface.threeD.threeDViewState.bearing! < -90
                    ? "-start"
                    : "-end"),
                getPosition: [
                  main3Dextents[0],
                  main3Dextents[4],
                  (step - elevationOffset) * 1000,
                ],
                getText: (d) => step.toString(),
                getTextAnchor:
                  sessionInterface.threeD.threeDViewState.bearing! < -90
                    ? "start"
                    : "end",
                getPixelOffset:
                  sessionInterface.threeD.threeDViewState.bearing! < -90
                    ? [8, 0]
                    : [-8, 0],
                visible:
                  (sessionInterface.threeD.threeDViewState.bearing! > 0 &&
                    sessionInterface.threeD.threeDViewState.bearing! < 90) ||
                  sessionInterface.threeD.threeDViewState.bearing! < -90,
              }),
            );

            // northern bound
            layers_to_set.push(
              new LineLayer({
                ...commonArgsLine,
                id: "Nbound" + step,
                getSourcePosition: [
                  main3Dextents[0],
                  main3Dextents[4],
                  (step - elevationOffset) * 1000,
                ],
                getTargetPosition: [
                  main3Dextents[3],
                  main3Dextents[4],
                  (step - elevationOffset) * 1000,
                ],
                visible:
                  Math.abs(sessionInterface.threeD.threeDViewState.bearing!) <
                  90,
              }),
            );

            // northeastern bound
            layers_to_set.push(
              new TextLayer({
                ...commonArgsText,
                id:
                  "NEtext" +
                  step +
                  (sessionInterface.threeD.threeDViewState.bearing! <= 90
                    ? "-start"
                    : "-end"),
                getPosition: [
                  main3Dextents[3],
                  main3Dextents[4],
                  (step - elevationOffset) * 1000,
                ],
                getText: (d) => step.toString(),
                getTextAnchor:
                  sessionInterface.threeD.threeDViewState.bearing! <= 90
                    ? "start"
                    : "end",
                getPixelOffset:
                  sessionInterface.threeD.threeDViewState.bearing! <= 90
                    ? [8, 0]
                    : [-8, 0],
                visible:
                  (sessionInterface.threeD.threeDViewState.bearing! >= -90 &&
                    sessionInterface.threeD.threeDViewState.bearing! <= 0) ||
                  sessionInterface.threeD.threeDViewState.bearing! >= 90,
              }),
            );

            // eastern bound
            layers_to_set.push(
              new LineLayer({
                ...commonArgsLine,
                id: "Sbound" + step,
                getSourcePosition: [
                  main3Dextents[3],
                  main3Dextents[4],
                  (step - elevationOffset) * 1000,
                ],
                getTargetPosition: [
                  main3Dextents[3],
                  main3Dextents[1],
                  (step - elevationOffset) * 1000,
                ],
                visible: sessionInterface.threeD.threeDViewState.bearing! > 0,
              }),
            );

            // southeastern bound
            layers_to_set.push(
              new TextLayer({
                ...commonArgsText,
                id:
                  "SEtext" +
                  step +
                  (sessionInterface.threeD.threeDViewState.bearing! > -90
                    ? "-start"
                    : "-end"),
                getPosition: [
                  main3Dextents[3],
                  main3Dextents[1],
                  (step - elevationOffset) * 1000,
                ],
                getText: (d) => step.toString(),
                getTextAnchor:
                  sessionInterface.threeD.threeDViewState.bearing! > -90
                    ? "start"
                    : "end",
                getPixelOffset:
                  sessionInterface.threeD.threeDViewState.bearing! > -90
                    ? [8, 0]
                    : [-8, 0],
                visible:
                  (sessionInterface.threeD.threeDViewState.bearing! > 0 &&
                    sessionInterface.threeD.threeDViewState.bearing! < 90) ||
                  sessionInterface.threeD.threeDViewState.bearing! < -90,
              }),
            );

            // southern bound
            layers_to_set.push(
              new LineLayer({
                ...commonArgsLine,
                id: "Ebound" + step,
                getSourcePosition: [
                  main3Dextents[0],
                  main3Dextents[1],
                  (step - elevationOffset) * 1000,
                ],
                getTargetPosition: [
                  main3Dextents[3],
                  main3Dextents[1],
                  (step - elevationOffset) * 1000,
                ],
                visible:
                  Math.abs(sessionInterface.threeD.threeDViewState.bearing!) >=
                  90,
              }),
            );

            // southwestern bound
            layers_to_set.push(
              new TextLayer({
                ...commonArgsText,
                id:
                  "SWtext" +
                  step +
                  (sessionInterface.threeD.threeDViewState.bearing! >= 90
                    ? "-start"
                    : "-end"),
                getPosition: [
                  main3Dextents[0],
                  main3Dextents[1],
                  (step - elevationOffset) * 1000,
                ],
                getText: (d) => step.toString(),
                getTextAnchor:
                  sessionInterface.threeD.threeDViewState.bearing! >= 90
                    ? "start"
                    : "end",
                getPixelOffset:
                  sessionInterface.threeD.threeDViewState.bearing! >= 90
                    ? [8, 0]
                    : [-8, 0],
                visible:
                  (sessionInterface.threeD.threeDViewState.bearing! >= -90 &&
                    sessionInterface.threeD.threeDViewState.bearing! <= 0) ||
                  sessionInterface.threeD.threeDViewState.bearing! >= 90,
              }),
            );

            // western bound
            layers_to_set.push(
              new LineLayer({
                ...commonArgsLine,
                id: "Wbound" + step,
                getSourcePosition: [
                  main3Dextents[0],
                  main3Dextents[4],
                  (step - elevationOffset) * 1000,
                ],
                getTargetPosition: [
                  main3Dextents[0],
                  main3Dextents[1],
                  (step - elevationOffset) * 1000,
                ],
                visible: sessionInterface.threeD.threeDViewState.bearing! <= 0,
              }),
            );
          });
        }
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
    depthIndicatorsVisible,
    textColor
  ]);

  return depthIndicatorlayers;
}
