import { dataSourceDataUrl } from "./data-source-query";
import { DataSource } from "../custom/types";

export type Cause = {
  code: number;
  prototype: {
    message: string;
  };
};

export const fetchData = async (
  dataSource: DataSource,
  slice?: [number, number] | undefined,
) => {
  // slicing
  let slice_encoded = "&slice=unset";

  if (slice) {
    if (!(slice[0] == 0 && slice[1] == -1)) {
      slice_encoded = "&slice=" + encodeURIComponent(JSON.stringify(slice));
    }
  }

  // get URL
  return await fetch(dataSourceDataUrl(dataSource) + slice_encoded).then(
    (res) => {
      if (!res.ok) {
        throw new Error("Error returned from Python backend", {
          cause: { code: res.status, prototype: { message: res.statusText } },
        });
      }
      return res.json();
    },
  );
};
