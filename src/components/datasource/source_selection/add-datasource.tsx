import { TinyColor } from "mui-color-input";
import path from "path";

import { DataSource, DataSourceFormatting, DataSourceMetaData } from "../types";

export const getInitDataSource = async (filepath: string) => {
  const initDataSource = await fetch(
    `/api/map_data?mode=metadata_query&filepath=${encodeURIComponent(filepath)}`,
  )
    .then((res) => res.json())
    .then((metadata: DataSourceMetaData) => {
      const internal_id = crypto.randomUUID();

      const colormapsBounds = Object.keys(metadata.variables.by_id).map(
        (variable: string) => {
          const obj: { [variable: string]: [number, number] | null } = {};
          obj[variable] = null;
          return obj;
        },
      );

      const initDataSource = {
        internal_id: internal_id,
        filepath: filepath,
        filename: path.basename(filepath),
        name: path.basename(filepath),
        interface: { pickable: false, visible: true, loadable: false },
        filtering: {},
        formatting: {
          twoD: {
            scale: 15,
            opacity: 100,
            antialiasing: false,
            positionOffset: 0,
            color: {
              mapping: "single",
              single: "rgb(0, 0, 0)" as unknown as TinyColor,
              linear: {
                variable: "mag",
                cmap: "Batlow",
                inverted: false,
                domain: Object.assign({}, ...colormapsBounds),
              },
              categorical: {
                variable: "",
                cmap: "BatlowS",
                inverted: false,
              },
            },
          } as DataSourceFormatting,
          threeD: {
            scale: 25,
            opacity: 100,
            antialiasing: false,
            positionOffset: 0,
            color: {
              mapping: "single",
              single: "rgb(0, 0, 0)" as unknown as TinyColor,
              linear: {
                variable: "mag",
                cmap: "Batlow",
                inverted: false,
                domain: Object.assign({}, ...colormapsBounds),
              },
              categorical: {
                variable: "",
                cmap: "BatlowS",
                inverted: false,
              },
            },
          } as DataSourceFormatting,
          plot: {
            scale: 5,
            opacity: 100,
            antialiasing: false,
            positionOffset: 0,
            color: {
              mapping: "single",
              single: "rgb(0, 0, 0)" as unknown as TinyColor,
              linear: {
                variable: "mag",
                cmap: "Batlow",
                inverted: false,
                domain: Object.assign({}, ...colormapsBounds),
              },
              categorical: {
                variable: "",
                cmap: "BatlowS",
                inverted: false,
              },
            },
          } as DataSourceFormatting,
        },
        metadata: metadata,
      } as DataSource;

      return initDataSource;
    });

  return initDataSource;
};
