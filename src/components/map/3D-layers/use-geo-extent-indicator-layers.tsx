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

  const textColor = color(theme.palette.text.primary) as RGBColor;

  // depth indicators
  const geoExtentIndicatorLayers = useMemo(() => {
    // if (GeoExtentIndicatorsVisible) {
    let layers_to_set = [] as (LineLayer | TextLayer)[];

    const main3Dextents = extents["main"] as
      | [number, number, number, number, number, number]
      | null;

    if (main3Dextents) {
      const bottomHeight = Math.ceil(main3Dextents[5]);

      const commonArgsLine = {
        getColor: [127.5, 127.5, 127.5],
        opacity: textColor!.opacity,
        getWidth: 1,
        antialiasing: true,
      } as unknown as LineLayerProps;

      const commonArgsText = {
        getColor: [textColor!.r, textColor!.g, textColor!.b],
        opacity: textColor!.opacity,
        getSize: 11,
        antialiasing: true,
        fontFamily: "Archivo Variable",
        fontWeight: "100",
        extensions: [new FixedSizeExtension()],
      } as unknown as LineLayerProps;

      const boundPositions = [
        {
          // northern bound
          source: [main3Dextents[0], main3Dextents[4], (-bottomHeight - elevationOffset) * 1000],
          target: [main3Dextents[3], main3Dextents[4], (-bottomHeight - elevationOffset) * 1000],
        },
        {
          // eastern bound
          source: [main3Dextents[3], main3Dextents[4], (-bottomHeight - elevationOffset) * 1000],
          target: [main3Dextents[3], main3Dextents[1], (-bottomHeight - elevationOffset) * 1000],
        },
        {
          // southern bound
          source: [main3Dextents[0], main3Dextents[1], (-bottomHeight - elevationOffset) * 1000],
          target: [main3Dextents[3], main3Dextents[1], (-bottomHeight - elevationOffset) * 1000],
        },
        {
          // western bound
          source: [main3Dextents[0], main3Dextents[4], (-bottomHeight - elevationOffset) * 1000],
          target: [main3Dextents[0], main3Dextents[1], (-bottomHeight - elevationOffset) * 1000],
        },
      ];

      // bounds
      layers_to_set.push(
        new LineLayer({
          ...commonArgsLine,
          data: boundPositions,
          id: "NBboundGP",
          getSourcePosition: (pos) => pos.source,
          getTargetPosition: (pos) => pos.target,
          visible: GeoExtentIndicatorsVisible,
        }),
      );

      // longitude ticks
      const xtickvalues = ticks(main3Dextents[0], main3Dextents[3], 15);

      // xtickvalues.forEach((xtickvalue) => {
      layers_to_set.push(
        new LineLayer({
          ...commonArgsLine,
          data: xtickvalues,
          id: "xticksGE",
          getSourcePosition: xtickvalue => [
            xtickvalue,
            main3Dextents[1],
            (-bottomHeight - elevationOffset) * 1000,
          ],
          getTargetPosition: xtickvalue => [
            xtickvalue,
            main3Dextents[4],
            (-bottomHeight - elevationOffset) * 1000,
          ],
          visible: GeoExtentIndicatorsVisible,
        }),
      );

      layers_to_set.push(
        new TextLayer({
          ...commonArgsText,
          data: xtickvalues,
          id:
            "xtickstextGE" +
            "-" +
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
          getPosition: xtickvalue => [
            xtickvalue,
            Math.abs(sessionInterface.threeD.threeDViewState.bearing!) < 90
              ? main3Dextents[1]
              : main3Dextents[4],
            (-bottomHeight - elevationOffset) * 1000,
          ],
          getText: xtickvalue => xtickvalue.toString(),
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
            visible: GeoExtentIndicatorsVisible,
        }),
      );
      // });

      // longitude ticks
      const ytickvalues = ticks(main3Dextents[1], main3Dextents[4], 15);

      // ytickvalues.forEach((ytickvalue) => {
      layers_to_set.push(
        new LineLayer({
          ...commonArgsLine,
          data: ytickvalues,
          id: "ytickGE",
          getSourcePosition: ytickvalue => [
            main3Dextents[0],
            ytickvalue,
            (-bottomHeight - elevationOffset) * 1000,
          ],
          getTargetPosition: ytickvalue => [
            main3Dextents[3],
            ytickvalue,
            (-bottomHeight - elevationOffset) * 1000,
          ],
          visible: GeoExtentIndicatorsVisible,
        }),
      );

      layers_to_set.push(
        new TextLayer({
          ...commonArgsText,
          data: ytickvalues,
          id:
            "ytickstextGE" +
            "-" +
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
          getPosition: ytickvalue => [
            sessionInterface.threeD.threeDViewState.bearing! < 0
              ? main3Dextents[3]
              : main3Dextents[0],
              ytickvalue,
            (-bottomHeight - elevationOffset) * 1000,
          ],
          getText: ytickvalue => ytickvalue.toString(),
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
            visible: GeoExtentIndicatorsVisible,
        }),
      );
        // });
      // }

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
