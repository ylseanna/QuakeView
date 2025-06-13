import path from "path";
import {
  DataSource,
  DataSourceDataDescription,
  DataSourceFormatting,
  DataSourceMetaData,
} from "./types";

export const getInitDataSource = async (filepath: string) => {
  const initDataSource = await fetch(
    `/api/map_data?mode=metadata_query&filepath=${encodeURIComponent(filepath)}`
  )
    .then((res) => res.json())
    .then((metadata: DataSourceMetaData) => {
      const internal_id = crypto.randomUUID();

      console.log(metadata.data_descr)

      const colormapsBounds = metadata.data_descr!.map(
        (dataDescr: DataSourceDataDescription) => {
          const obj: { [variable: string]: [number, number] } = {};
          obj[dataDescr.variable] = dataDescr.bounds;
          return obj;
        }
      );

      const initDataSource =  {
        internal_id: internal_id,
        filepath: filepath,
        filename: path.basename(filepath),
        name: path.basename(filepath),
        interface: { pickable: false, visible: true, addedVars: [] },
        filtering: {
          mag: metadata.data_descr.find(
            (dd: DataSourceDataDescription) => dd.variable == "mag"
          )?.bounds,
          t: metadata.data_descr.find(
            (dd: DataSourceDataDescription) => dd.variable == "t"
          )?.bounds,
        },
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

      return initDataSource
    });

    return initDataSource
};
