import { DataSource } from "./types";

export function dataSourceDataUrl(dataSource: DataSource) {
  const var_mappings = dataSource.metadata.variables.required_vars.map(
    (variable: string) =>
      "&" +
      variable +
      "=" +
      encodeURIComponent(
        JSON.stringify(
          dataSource.metadata.variables.by_id[variable].mapped_var,
        ),
      ),
  );

  const var_mappings_uri = var_mappings.filter((n) => n).join("");

  const vars = encodeURIComponent(
    JSON.stringify(dataSource.metadata.variables.required_vars.concat(dataSource.metadata.variables.added_vars)),
  );
  return `/api/map_data?mode=data_query&filepath=${dataSource.filepath}${"&vars=" + vars}${var_mappings ? var_mappings_uri : ""}`;
}

export function updatedMetaDataUrl(dataSource: DataSource) {
  const var_mappings = dataSource.metadata.variables.required_vars.map(
    (variable: string) =>
      "&" +
      variable +
      "=" +
      encodeURIComponent(
        JSON.stringify(
          dataSource.metadata.variables.by_id[variable].mapped_var,
        ),
      ),
  );

  const var_mappings_uri = var_mappings.filter((n) => n).join("");

  const vars = encodeURIComponent(
    JSON.stringify(dataSource.metadata.variables.required_vars.concat(dataSource.metadata.variables.added_vars)),
  );
  return `/api/map_data?mode=metadata_query&filepath=${dataSource.filepath}${"&vars=" + vars}${var_mappings ? var_mappings_uri : ""}`;
}