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
  return `/api/map_data?mode=data_query&filepath=${dataSource.filepath}${addedVars ? "&added_vars=" + addedVars : ""}${var_mappings ? var_mappings_uri : ""}`
}
