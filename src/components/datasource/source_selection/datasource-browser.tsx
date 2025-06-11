"use client";

import {
  DataSource,
  DATASOURCE_JSON_CODEC,
} from "@/components/datasource/types";

import DataTab from "./datasource-tab";
import { useLocalStorageState } from "@toolpad/core";

export default function DataSourceBrowser() {
  const [dataSources, setDataSources] = useLocalStorageState<DataSource[]>("data-sources", [], {
    codec: DATASOURCE_JSON_CODEC,
  });



  return (
    <div>
      {!dataSources
        ? null
        : (dataSources as DataSource[]).map((dataSource) => (
            <DataTab key={dataSource.internal_id} dataSource={dataSource} dataSources={dataSources} setDataSources={setDataSources}/>
          ))}
    </div>
  );
}
