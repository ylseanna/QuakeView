import { dataSourceDataUrl } from "./data-source-query";
import { DataSource } from "./types";

export type Cause = {
    code: number;
    prototype: {
      message: string
    }
};

export const fetchData = async (dataSource: DataSource) => {
  return await fetch(dataSourceDataUrl(dataSource)).then((res) => {
    if (!res.ok) {
      throw new Error("Error returned from Python backend", {cause: {code: res.status, prototype: {message: res.statusText }}});
    }
    return res.json();
  });
};
