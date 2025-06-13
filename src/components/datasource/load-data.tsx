import { dataSourceDataUrl } from "./data-source-query";
import { DataSource } from "./types";

export const fetchData = async (dataSource: DataSource) => {
  return await fetch(dataSourceDataUrl(dataSource)).then((res) => res.json());
};
