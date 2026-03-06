"use client";

import DataTab from "./datasource-tab";
import { useProjectStore } from "@/providers/project-store-provider";

export default function DataSourceBrowser() {
  const dataSourceIDS = useProjectStore((state) => state.dataSources.allIDs);

  return (
    <div>
      {!dataSourceIDS
        ? null
        : dataSourceIDS.map((dataSourceID) => (
            <DataTab key={"DataTab-" + dataSourceID} id={dataSourceID} />
          ))}
    </div>
  );
}
