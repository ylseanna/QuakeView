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

  const encoded_var_mappings = var_mappings.filter((n) => n).join("");

  const encoded_vars = encodeURIComponent(
    JSON.stringify(
      dataSource.metadata.variables.required_vars.concat(
        dataSource.metadata.variables.added_vars,
      ),
    ),
  );

  const filtering = dataSource.filtering;
  let encoded_filtering = "";
  if (filtering) {
    encoded_filtering = encodeURIComponent(JSON.stringify(filtering));
  }

  return `/api/map_data?mode=data_query&filepath=${dataSource.filepath}${"&vars=" + encoded_vars}${var_mappings ? encoded_var_mappings : ""}${filtering ? "&filtering=" + encoded_filtering : ""}`;
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
    JSON.stringify(
      dataSource.metadata.variables.required_vars.concat(
        dataSource.metadata.variables.added_vars,
      ),
    ),
  );
  return `/api/map_data?mode=metadata_query&filepath=${dataSource.filepath}${"&vars=" + vars}${var_mappings ? var_mappings_uri : ""}`;
}
