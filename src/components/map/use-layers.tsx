import { LineLayer, ScatterplotLayer, ScatterplotLayerProps } from "@deck.gl/layers";
import { Color, LayerProps } from "@deck.gl/core";
import { useMemo } from "react";
import * as d3 from "d3";

import { useProjectStore } from "@/providers/project-store-provider";
import { DataSource, DataSourceColorFormatting, Earthquake } from "@/components/custom/types";
import { colormaps, colormaps_categorical } from "./crameri-colormaps";
import { useCatalogData } from "../data/use-data";
import { usePathname } from "@/i18n/routing";

const d3Color_to_deckGLColor = (color: d3.RGBColor) =>
  [color.r, color.g, color.b] as Color;

export function useStemPlotLayers(
  scaleX: d3.ScaleTime<number, number, never> | null,
  scaleY: d3.ScaleLinear<number, number, never> | null,
  baseLineY: number,
  include_stem: boolean = true,
) {
  const dataSources = useProjectStore((state) => state.dataSources);

  const { data } = useCatalogData();

  const pathname = usePathname()

  const { pickable } = useProjectStore((state) => state.sessionInterface);

  const layers = useMemo(() => {
    if (data.allIDs) {
      if (scaleX && scaleY) {
        return data.allIDs.map((dataSourceID) => {
          if (data.byID[dataSourceID]) {
            const linearColorScale = d3
              .scaleSequential(
                d3.piecewise(
                  d3.interpolateRgb,
                  !dataSources.byID[dataSourceID].formatting.plot.color.linear
                    .inverted
                    ? colormaps[
                        dataSources.byID[dataSourceID].formatting.plot.color
                          .linear.cmap as keyof typeof colormaps
                      ]
                    : colormaps[
                        dataSources.byID[dataSourceID].formatting.plot.color
                          .linear.cmap as keyof typeof colormaps
                      ].toReversed(),
                ),
              )
              .domain(
                dataSources.byID[dataSourceID].formatting.plot.color.linear
                  .domain[
                  dataSources.byID[dataSourceID].formatting.plot.color.linear
                    .variable
                ]!,
              );

            const categoricalColorScale = d3
              .scaleOrdinal()
              .range(
                !dataSources.byID[dataSourceID].formatting.plot.color
                  .categorical.inverted
                  ? colormaps_categorical[
                      dataSources.byID[dataSourceID].formatting.plot.color
                        .categorical.cmap
                    ]
                  : colormaps_categorical[
                      dataSources.byID[dataSourceID].formatting.plot.color
                        .categorical.cmap
                    ].toReversed(),
              )
              .domain(
                d3
                  .range(
                    colormaps_categorical[
                      dataSources.byID[dataSourceID].formatting.plot.color
                        .categorical.cmap
                    ].length,
                  )
                  .map((i) => String(i)),
              );

            const ColorMapping = (
              d: Earthquake,
              colorFormatting: DataSourceColorFormatting,
            ) => {
              if (colorFormatting.mapping == "linear") {
                return d3Color_to_deckGLColor(
                  d3.color(
                    linearColorScale(
                      d[colorFormatting.linear.variable] as d3.NumberValue,
                    ),
                  ) as d3.RGBColor,
                );
              } else if (colorFormatting.mapping == "categorical") {
                const length =
                  colormaps_categorical[colorFormatting.categorical.cmap]
                    .length;

                if (Number.isInteger(d[colorFormatting.categorical.variable])) {
                  const value =
                    Number(d[colorFormatting.categorical.variable]) % length;

                  return d3Color_to_deckGLColor(
                    d3.color(
                      categoricalColorScale(String(value)) as string,
                    ) as d3.RGBColor,
                  );
                } else {
                  // .scaleSequential(colormaps_categorical[colorFormatting.categorical.cmap])
                  return d3Color_to_deckGLColor(
                    d3.color(
                      categoricalColorScale("1") as string,
                    ) as d3.RGBColor,
                  );
                }
              }
            };

            const scatterplotLayer = new ScatterplotLayer<Earthquake>({
              id: `DotLayer_${dataSources.byID[dataSourceID].internal_id}_${JSON.stringify(dataSources.byID[dataSourceID].formatting.plot.color)}_${JSON.stringify(scaleX.domain())}_${JSON.stringify(scaleY.domain())}_${Math.random()}`, // absolutely stupid way of making it listen to a color state update and forcing a rerender
              data: data.byID[dataSources.byID[dataSourceID].internal_id].data,
              getRadius: 0.1,
              radiusScale: dataSources.byID[dataSourceID].formatting.plot.scale,
              getPosition: (d: Earthquake) => [scaleX(d.t), scaleY(d.mag)],
              visible: dataSources.byID[dataSourceID].interface.visible,
              getFillColor:
                dataSources.byID[dataSourceID].formatting.plot.color.mapping ==
                "single"
                  ? d3Color_to_deckGLColor(
                      d3.color(
                        dataSources.byID[dataSourceID].formatting.plot.color
                          .single as unknown as string,
                      ) as d3.RGBColor,
                    )
                  : (d: Earthquake) =>
                      ColorMapping(
                        d,
                        dataSources.byID[dataSourceID].formatting.plot.color,
                      ) as Color,
              autoHighlight: true,
              highlightColor: [255, 255, 255, 140],
              colorFormat: "RGB",
              opacity:
                dataSources.byID[dataSourceID].formatting.plot.opacity / 100,
              stroked: false,
              getLineColor: [255, 255, 255, 0.5 * 255],
              lineWidthUnits: "pixels",
              billboard: true,
              antialiasing:
                dataSources.byID[dataSourceID].formatting.plot.antialiasing,
              pickable: pickable,
              fp64: true,
            } as Partial<
              Required<ScatterplotLayerProps<Earthquake>> & Required<LayerProps>
            >);

            // if (include_stem) {
            //   return [
            //     new LineLayer<Earthquake>({
            //       id: `StemLayer_${dataSources.byID[dataSourceID].internal_id}_${JSON.stringify(dataSources.byID[dataSourceID].formatting.plot.color)}_${JSON.stringify(scaleX.domain())}_${JSON.stringify(scaleY.domain())}`, // absolutely stupid way of making it listen to a color state update and forcing a rerender
            //       data: data.byID[dataSources.byID[dataSourceID].internal_id]
            //         .data,
            //       getWidth: 0.05,
            //       widthScale:
            //         dataSources.byID[dataSourceID].formatting.plot.scale,
            //       getSourcePosition: (d: Earthquake) => [
            //         scaleX(d.t),
            //         scaleY(d.mag),
            //       ],
            //       getTargetPosition: (d: Earthquake) => [
            //         scaleX(d.t),
            //         baseLineY,
            //       ],
            //       visible: dataSources.byID[dataSourceID].interface.visible,
            //       // getColor: (d: Earthquake) =>
            //       //   ColorMapping(d, dataSource.formatting.plot.color) as Color,
            //       getColor: [0, 0, 0],
            //       autoHighlight: true,
            //       highlightColor: [255, 255, 255, 140],
            //       colorFormat: "RGB",
            //       opacity: 0.1,
            //       pickable: false,
            //     }),
            //     scatterplotLayer,
            //   ];
            // } else {
              return scatterplotLayer;
            }
        //   }
        });
      }
    }
  }, [dataSources, data, pathname, scaleX, scaleY]);

  return layers;
}
