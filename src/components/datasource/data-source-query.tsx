import { DataSource, DataSourceDataDescription } from "./types";

export function dataSourceDataUrl(dataSource: DataSource) {
  const var_mappings = dataSource.metadata.data_descr.map(
    (dataDescription: DataSourceDataDescription) => {
      if (dataDescription.required) {
        return (
          "&" +
          dataDescription.variable +
          "=" +
          encodeURIComponent(JSON.stringify(dataDescription.mapped_var))
        );
      }
    }
  );

  const var_mappings_uri = var_mappings.filter((n) => n).join("");

  const addedVars = encodeURIComponent(
    JSON.stringify(dataSource.interface.addedVars)
  );
  console.log(process.env.NEXT_PUBLIC_HOST)

  return `http://${process.env.NEXT_PUBLIC_HOST}${process.env.NEXT_PUBLIC_APP_BASE_PATH}/api/map_data?mode=data_query&filename=${dataSource.filename}${addedVars ? "&added_vars=" + addedVars : ""}${var_mappings ? var_mappings_uri : ""}`
}
