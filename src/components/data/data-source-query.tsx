import { DataSource } from "../custom/types";

export function dataSourceDataUrl(dataSource: DataSource) {
  const var_maps = Object.fromEntries(
    dataSource.metadata.variables.required_vars
      .concat(dataSource.metadata.variables.datetime_vars)
      .map((variable: string) => [
        variable,
        dataSource.metadata.variables.by_id[variable].mapped_var,
      ]),
  );

  const encoded_var_maps = encodeURIComponent(JSON.stringify(var_maps));

  const encoded_vars = encodeURIComponent(
    JSON.stringify(
      dataSource.metadata.variables.required_vars
        .concat(dataSource.metadata.variables.datetime_vars)
        .concat(dataSource.metadata.variables.added_vars),
    ),
  );

  const sep = encodeURIComponent(dataSource.metadata.sep);
  const index = encodeURIComponent(dataSource.metadata.index);
  const DTFormat = encodeURIComponent(dataSource.metadata.datetime_format);

  const header = encodeURIComponent(dataSource.metadata.header);
  const columnNames = encodeURIComponent(
    JSON.stringify(dataSource.metadata.column_names),
  );

  const filtering = dataSource.filtering;
  let encoded_filtering = "";
  if (filtering) {
    encoded_filtering = encodeURIComponent(JSON.stringify(filtering));
  }

  return `/api/earthquake_catalog?mode=data&filepath=${dataSource.filepath}&sep=${sep}&index=${index}&datetimeformat=${DTFormat}&header=${header}&column_names=${columnNames}${"&vars=" + encoded_vars}${"&var_maps=" + encoded_var_maps}${filtering ? "&filtering=" + encoded_filtering : ""}`;
}

export function updatedMetaDataUrl(dataSource: DataSource) {
  const sep = encodeURIComponent(dataSource.metadata.sep);
  const index = encodeURIComponent(dataSource.metadata.index);
  const DTFormat = encodeURIComponent(dataSource.metadata.datetime_format);

  const header = encodeURIComponent(dataSource.metadata.header);

  const columnNames = encodeURIComponent(
    JSON.stringify(dataSource.metadata.column_names),
  );

  const var_maps = Object.fromEntries(
    dataSource.metadata.variables.required_vars
      .concat(dataSource.metadata.variables.datetime_vars)
      .map((variable: string) => [
        variable,
        dataSource.metadata.variables.by_id[variable].mapped_var,
      ]),
  );

  const encoded_var_maps = encodeURIComponent(JSON.stringify(var_maps));

  const encoded_vars = encodeURIComponent(
    JSON.stringify(
      dataSource.metadata.variables.required_vars
        .concat(dataSource.metadata.variables.datetime_vars)
        .concat(dataSource.metadata.variables.added_vars),
    ),
  );

  return `/api/earthquake_catalog?mode=metadata&filepath=${dataSource.filepath}&sep=${sep}&index=${index}&datetimeformat=${DTFormat}&header=${header}&column_names=${columnNames}${"&vars=" + encoded_vars}${"&var_maps=" + encoded_var_maps}`;
}
