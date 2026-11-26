"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useMemo } from "react";
import "@deck.gl/widgets/stylesheet.css";
import { useProjectStore } from "@/providers/project-store-provider";
import { LayerExtension, LineLayer, LineLayerProps, TextLayer } from "deck.gl";
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

export function useGeoExtentIndicatorLayers() {
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
  const GeoExtentIndicatorsVisible = useAppStateStore(
    (state) => state.appInterface,
  ).views.threeDGeoExtentIndicatorsVisible;

  // get extents
  const extents = useExtents("threeD");

  const textColor = color(theme.palette.text.secondary) as RGBColor;

  // depth indicators
  const geoExtentIndicatorLayers = useMemo(() => {
    if (GeoExtentIndicatorsVisible) {
      let layers_to_set = [] as (LineLayer | TextLayer)[];

      const main3Dextents = extents["main"] as
        | [number, number, number, number, number, number]
        | null;

      if (main3Dextents) {
        const bottomHeight = Math.ceil(main3Dextents[5]);

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
          // sizeUnits: "meters",
          // sizeMaxPixels: 12,
          // sizeMinPixels: 10,
          antialiasing: true,
          fontFamily: "Archivo Variable",
          fontWeight: "100",
          extensions: [new FixedSizeExtension()],
        } as unknown as LineLayerProps;

        // northern bottom bound
        layers_to_set.push(
          new LineLayer({
            ...commonArgsLine,
            id: "NBboundGE",
            getSourcePosition: [
              main3Dextents[0],
              main3Dextents[4],
              (-bottomHeight - elevationOffset) * 1000,
            ],
            getTargetPosition: [
              main3Dextents[3],
              main3Dextents[4],
              (-bottomHeight - elevationOffset) * 1000,
            ],
          }),
        );

        // eastern bottom bound
        layers_to_set.push(
          new LineLayer({
            ...commonArgsLine,
            id: "SBboundGE",
            getSourcePosition: [
              main3Dextents[3],
              main3Dextents[4],
              (-bottomHeight - elevationOffset) * 1000,
            ],
            getTargetPosition: [
              main3Dextents[3],
              main3Dextents[1],
              (-bottomHeight - elevationOffset) * 1000,
            ],
          }),
        );

        // southern bottom bound
        layers_to_set.push(
          new LineLayer({
            ...commonArgsLine,
            id: "EBboundGE",
            getSourcePosition: [
              main3Dextents[0],
              main3Dextents[1],
              (-bottomHeight - elevationOffset) * 1000,
            ],
            getTargetPosition: [
              main3Dextents[3],
              main3Dextents[1],
              (-bottomHeight - elevationOffset) * 1000,
            ],
          }),
        );

        // western bottom bound
        layers_to_set.push(
          new LineLayer({
            ...commonArgsLine,
            id: "WBboundGE",
            getSourcePosition: [
              main3Dextents[0],
              main3Dextents[4],
              (-bottomHeight - elevationOffset) * 1000,
            ],
            getTargetPosition: [
              main3Dextents[0],
              main3Dextents[1],
              (-bottomHeight - elevationOffset) * 1000,
            ],
          }),
        );

        // longitude ticks
        const xtickvalues = ticks(main3Dextents[0], main3Dextents[3], 15);

        xtickvalues.forEach((xtickvalue) => {
          layers_to_set.push(
            new LineLayer({
              ...commonArgsLine,
              id: "xtickGE" + xtickvalue,
              getSourcePosition: [
                xtickvalue,
                main3Dextents[1],
                (-bottomHeight - elevationOffset) * 1000,
              ],
              getTargetPosition: [
                xtickvalue,
                main3Dextents[4],
                (-bottomHeight - elevationOffset) * 1000,
              ],
            }),
          );

          layers_to_set.push(
            new TextLayer({
              ...commonArgsText,
              id:
                "xticktextGE" +
                xtickvalue + "-" +
                (
                  sessionInterface.threeD.threeDViewState.bearing! >= 0 && sessionInterface.threeD.threeDViewState.bearing! < 30
                  ? "first-eighth"
                  : sessionInterface.threeD.threeDViewState.bearing! >= 30 && sessionInterface.threeD.threeDViewState.bearing! < 90
                  ? "second-eighth"
                  : sessionInterface.threeD.threeDViewState.bearing! >= 90 && sessionInterface.threeD.threeDViewState.bearing! < 150
                  ? "third-eighth"
                  : sessionInterface.threeD.threeDViewState.bearing! >= 150 && sessionInterface.threeD.threeDViewState.bearing! <= 180
                  ? "fourth-eighth" :
                  sessionInterface.threeD.threeDViewState.bearing! >= -30 && sessionInterface.threeD.threeDViewState.bearing! < 0
                  ? "minus-first-eighth"
                  : sessionInterface.threeD.threeDViewState.bearing! >= -90 && sessionInterface.threeD.threeDViewState.bearing! < -30
                  ? "minus-second-eighth"
                  : sessionInterface.threeD.threeDViewState.bearing! >= -150 && sessionInterface.threeD.threeDViewState.bearing! < -90
                  ? "minus-third-eighth"
                  : sessionInterface.threeD.threeDViewState.bearing! >= -180 && sessionInterface.threeD.threeDViewState.bearing! <= -150
                  ? "minus-fourth-eighth"
                  : "last-eigtht"
                ),
              getPosition: [
                xtickvalue,
                Math.abs(sessionInterface.threeD.threeDViewState.bearing!) < 90
                  ? main3Dextents[1]
                  : main3Dextents[4],
                (-bottomHeight - elevationOffset) * 1000,
              ],
              getText: (d) => xtickvalue.toString(),
              getTextAnchor:
                (
                  sessionInterface.threeD.threeDViewState.bearing! >= 0 && sessionInterface.threeD.threeDViewState.bearing! < 30
                  ? "middle"
                  : sessionInterface.threeD.threeDViewState.bearing! >= 30 && sessionInterface.threeD.threeDViewState.bearing! < 90
                  ? "start"
                  : sessionInterface.threeD.threeDViewState.bearing! >= 90 && sessionInterface.threeD.threeDViewState.bearing! < 150
                  ? "end"
                  : sessionInterface.threeD.threeDViewState.bearing! >= 150 && sessionInterface.threeD.threeDViewState.bearing! <= 180
                  ? "middle" :
                  sessionInterface.threeD.threeDViewState.bearing! >= -30 && sessionInterface.threeD.threeDViewState.bearing! < 0
                  ? "middle"
                  : sessionInterface.threeD.threeDViewState.bearing! >= -90 && sessionInterface.threeD.threeDViewState.bearing! < -30
                  ? "end"
                  : sessionInterface.threeD.threeDViewState.bearing! >= -150 && sessionInterface.threeD.threeDViewState.bearing! < -90
                  ? "start"
                  : sessionInterface.threeD.threeDViewState.bearing! >= -180 && sessionInterface.threeD.threeDViewState.bearing! <= -150
                  ? "middle"
                  : "middle"
                ),
              getPixelOffset:
                (
                  sessionInterface.threeD.threeDViewState.bearing! >= 0 && sessionInterface.threeD.threeDViewState.bearing! < 30
                  ? [0,12]
                  : sessionInterface.threeD.threeDViewState.bearing! >= 30 && sessionInterface.threeD.threeDViewState.bearing! < 90
                  ? [8,0]
                  : sessionInterface.threeD.threeDViewState.bearing! >= 90 && sessionInterface.threeD.threeDViewState.bearing! < 150
                  ? [-8,0]
                  : sessionInterface.threeD.threeDViewState.bearing! >= 150 && sessionInterface.threeD.threeDViewState.bearing! <= 180
                  ? [0,12] :
                  sessionInterface.threeD.threeDViewState.bearing! >= -30 && sessionInterface.threeD.threeDViewState.bearing! < 0
                  ? [0,12]
                  : sessionInterface.threeD.threeDViewState.bearing! >= -90 && sessionInterface.threeD.threeDViewState.bearing! < -30
                  ? [-8,0]
                  : sessionInterface.threeD.threeDViewState.bearing! >= -150 && sessionInterface.threeD.threeDViewState.bearing! < -90
                  ? [8,0]
                  : sessionInterface.threeD.threeDViewState.bearing! >= -180 && sessionInterface.threeD.threeDViewState.bearing! <= -150
                  ? [0, 12]
                  : [0,12]
                ),
            }),
          );
        });

        // longitude ticks
        const ytickvalues = ticks(main3Dextents[1], main3Dextents[4], 15);

        ytickvalues.forEach((ytickvalue) => {
          layers_to_set.push(
            new LineLayer({
              ...commonArgsLine,
              id: "xtickGE" + ytickvalue,
              getSourcePosition: [
                main3Dextents[0],
                ytickvalue,
                (-bottomHeight - elevationOffset) * 1000,
              ],
              getTargetPosition: [
                main3Dextents[3],
                ytickvalue,
                (-bottomHeight - elevationOffset) * 1000,
              ],
            }),
          );

          layers_to_set.push(
            new TextLayer({
              ...commonArgsText,
              id:
                "yticktextGE" +
                ytickvalue + "-" +
                (
                  sessionInterface.threeD.threeDViewState.bearing! >= 0 && sessionInterface.threeD.threeDViewState.bearing! < 60
                  ? "first-eighth"
                  : sessionInterface.threeD.threeDViewState.bearing! >= 60 && sessionInterface.threeD.threeDViewState.bearing! < 90
                  ? "second-eighth"
                  : sessionInterface.threeD.threeDViewState.bearing! >= 90 && sessionInterface.threeD.threeDViewState.bearing! < 120
                  ? "third-eighth"
                  : sessionInterface.threeD.threeDViewState.bearing! >= 120 && sessionInterface.threeD.threeDViewState.bearing! <= 180
                  ? "fourth-eighth" :
                  sessionInterface.threeD.threeDViewState.bearing! >= -60 && sessionInterface.threeD.threeDViewState.bearing! < 0
                  ? "minus-first-eighth"
                  : sessionInterface.threeD.threeDViewState.bearing! >= -90 && sessionInterface.threeD.threeDViewState.bearing! < -60
                  ? "minus-second-eighth"
                  : sessionInterface.threeD.threeDViewState.bearing! >= -120 && sessionInterface.threeD.threeDViewState.bearing! < -90
                  ? "minus-third-eighth"
                  : sessionInterface.threeD.threeDViewState.bearing! >= -180 && sessionInterface.threeD.threeDViewState.bearing! <= -120
                  ? "minus-fourth-eighth"
                  : "last-eigtht"
                ),
              getPosition: [
               sessionInterface.threeD.threeDViewState.bearing! < 0
                  ? main3Dextents[3]
                  : main3Dextents[0],
                  ytickvalue,
                (-bottomHeight - elevationOffset) * 1000,
              ],
              getText: (d) => ytickvalue.toString(),
              getTextAnchor:
                (
                  sessionInterface.threeD.threeDViewState.bearing! >= 0 && sessionInterface.threeD.threeDViewState.bearing! < 60
                  ? "end"
                  : sessionInterface.threeD.threeDViewState.bearing! >= 60 && sessionInterface.threeD.threeDViewState.bearing! < 90
                  ? "middle"
                  : sessionInterface.threeD.threeDViewState.bearing! >= 90 && sessionInterface.threeD.threeDViewState.bearing! < 120
                  ? "middle"
                  : sessionInterface.threeD.threeDViewState.bearing! >= 120 && sessionInterface.threeD.threeDViewState.bearing! <= 180
                  ? "start" :
                  sessionInterface.threeD.threeDViewState.bearing! >= -60 && sessionInterface.threeD.threeDViewState.bearing! < 0
                  ? "start"
                  : sessionInterface.threeD.threeDViewState.bearing! >= -90 && sessionInterface.threeD.threeDViewState.bearing! < -60
                  ? "middle"
                  : sessionInterface.threeD.threeDViewState.bearing! >= -120 && sessionInterface.threeD.threeDViewState.bearing! < -90
                  ? "middle"
                  : sessionInterface.threeD.threeDViewState.bearing! >= -180 && sessionInterface.threeD.threeDViewState.bearing! <= -120
                  ? "end"
                  : "end"
                ),
              getPixelOffset:
                (
                  sessionInterface.threeD.threeDViewState.bearing! >= 0 && sessionInterface.threeD.threeDViewState.bearing! < 60
                  ? [-8,0]
                  : sessionInterface.threeD.threeDViewState.bearing! >= 60 && sessionInterface.threeD.threeDViewState.bearing! < 90
                  ? [0,12]
                  : sessionInterface.threeD.threeDViewState.bearing! >= 90 && sessionInterface.threeD.threeDViewState.bearing! < 120
                  ? [0,12]
                  : sessionInterface.threeD.threeDViewState.bearing! >= 120 && sessionInterface.threeD.threeDViewState.bearing! <= 180
                  ? [8,0] :
                  sessionInterface.threeD.threeDViewState.bearing! >= -60 && sessionInterface.threeD.threeDViewState.bearing! < 0
                  ? [8,0]
                  : sessionInterface.threeD.threeDViewState.bearing! >= -90 && sessionInterface.threeD.threeDViewState.bearing! < -60
                  ? [0,12]
                  : sessionInterface.threeD.threeDViewState.bearing! >= -120 && sessionInterface.threeD.threeDViewState.bearing! < -90
                  ? [0,12]
                  : sessionInterface.threeD.threeDViewState.bearing! >= -180 && sessionInterface.threeD.threeDViewState.bearing! <= -120
                  ? [-8, 0]
                  : [0,12]
                ),
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
    GeoExtentIndicatorsVisible,
    textColor,
  ]);

  return geoExtentIndicatorLayers;
}
