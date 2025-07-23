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

  const var_mappings_uri = var_mappings.join("");

  const addedVars = encodeURIComponent(
    JSON.stringify(dataSource.interface.addedVars)
  );
  return `/api/map_data?mode=data_query&filepath=${dataSource.filepath}${addedVars ? "&added_vars=" + addedVars : ""}${var_mappings ? var_mappings_uri : ""}`;
}

export function dataSourceMetaDataUrl(
  filepath: string,
  var_mappings: { [variable: string]: string[] }
) {

  const var_mappings_uri = "&var_mapping=" + encodeURIComponent(
    JSON.stringify(var_mappings)
  );

  return `/api/map_data?mode=metadata_query&filepath=${filepath}${var_mappings ? var_mappings_uri : ""}`;
}
