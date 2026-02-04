import { DataSource } from "./types";

export function dataSourceDataUrl(dataSource: DataSource) {
  const var_mappings = dataSource.metadata.variables.required_vars
    .concat(dataSource.metadata.variables.datetime_vars)
    .map(
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

  const encoded_var_mappings = var_mappings.join("");

  const encoded_vars = encodeURIComponent(
    JSON.stringify(
      dataSource.metadata.variables.required_vars
        .concat(dataSource.metadata.variables.datetime_vars)
        .concat(dataSource.metadata.variables.added_vars),
    ),
  );

  const sep = encodeURIComponent(dataSource.metadata.sep);
  const DTFormat = encodeURIComponent(dataSource.metadata.datetime_format);

  const filtering = dataSource.filtering;
  let encoded_filtering = "";
  if (filtering) {
    encoded_filtering = encodeURIComponent(JSON.stringify(filtering));
  }

  return `/api/map_data?mode=data_query&filepath=${dataSource.filepath}&sep=${sep}&datetimeformat=${DTFormat}${"&vars=" + encoded_vars}${var_mappings ? encoded_var_mappings : ""}${filtering ? "&filtering=" + encoded_filtering : ""}`;
}

export function updatedMetaDataUrl(dataSource: DataSource) {
  const var_mappings = dataSource.metadata.variables.required_vars
    .concat(dataSource.metadata.variables.datetime_vars)
    .map(
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

  const sep = encodeURIComponent(dataSource.metadata.sep);

  const DTFormat = encodeURIComponent(dataSource.metadata.datetime_format);

  const encoded_var_mappings = var_mappings.join("");

  const encoded_vars = encodeURIComponent(
    JSON.stringify(
      dataSource.metadata.variables.required_vars
        .concat(dataSource.metadata.variables.datetime_vars)
        .concat(dataSource.metadata.variables.added_vars),
    ),
  );

  return `/api/map_data?mode=metadata_query&filepath=${dataSource.filepath}&sep=${sep}&datetimeformat=${DTFormat}${"&vars=" + encoded_vars}${var_mappings ? encoded_var_mappings : ""}`;
}
