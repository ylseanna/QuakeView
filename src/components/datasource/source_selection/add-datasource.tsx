import path from "path";
import {
  DataSource,
  DataSourceDataDescription,
  DataSourceFormatting,
  DataSourceMetaData,
} from "../types";
import { dataSourceMetaDataUrl } from "../data-source-query";
import { DefaultVariableMappings } from "../constants";

export const getInitDataSource = async (filepath: string) => {
  const initDataSource = await fetch(
    dataSourceMetaDataUrl(filepath, DefaultVariableMappings)
  )
    .then((res) => res.json())
    .then((metadata: DataSourceMetaData) => {
      const internal_id = crypto.randomUUID();

      console.log(metadata.data_descr);

      const colormapsBounds = metadata.data_descr!.map(
        (dataDescr: DataSourceDataDescription) => {
          const obj: { [variable: string]: [number, number] } = {};
          obj[dataDescr.variable] = dataDescr.bounds;
          return obj;
        }
      );

      const initDataSource = {
        internal_id: internal_id,
        filepath: filepath,
        filename: path.basename(filepath),
        name: path.basename(filepath),
        interface: { pickable: false, visible: true, addedVars: [] },
        filtering: {},
        formatting: {
          scale: 15,
          opacity: 100,
          antialiasing: false,
          positionOffset: 0,
          color: {
            mapping: "single",
            single: "rgb(0, 0, 0)",
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
        metadata: metadata,
      } as DataSource;

      return initDataSource;
    });

  return initDataSource;
};
