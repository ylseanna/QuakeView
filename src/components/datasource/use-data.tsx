import { useQueries, UseQueryResult } from "@tanstack/react-query";

import { useProjectStore } from "@/providers/project-store-provider";
import { fetchData } from "./load-data";
import { DataSourceFiltering, EarthQuake, Extent } from "./types";

export type DataQueryResponse = {
      data: EarthQuake[];
      addedVars: string[];
      bounds: { [variable: string]: [number, number] | null };
      unfiltered_bounds: { [variable: string]: [number, number] | null };
      extent: Extent;
      filters: DataSourceFiltering;
    }

export type DataCache = {
  byID: {
    [id: string]: DataQueryResponse;
  };
  allIDs: string[];
};
export type DataCacheResult = {
  data: DataCache;
  pending: boolean;
};

export function useData() {
  const dataSources = useProjectStore((state) => state.dataSources);

  const queryOptions = {
    queries: dataSources.allIDs.map((dataSourceID) => {
      return {
        queryKey: [
          "data",
          dataSourceID,
          {
            filepath: dataSources.byID[dataSourceID].filepath,
            filtering: dataSources.byID[dataSourceID].filtering,
            variables: dataSources.byID[dataSourceID].metadata.variables.by_id,
            added_vars:
              dataSources.byID[dataSourceID].metadata.variables.added_vars,
          },
        ],
        queryFn: () => fetchData(dataSources.byID[dataSourceID]),
        enabled: dataSources.byID[dataSourceID].interface.loadable,
      };
    }),
    combine: (results: UseQueryResult<DataQueryResponse, Error>[]) => {
      return {
        data: {
          byID: Object.fromEntries(
            results
              .map((result, index) => [dataSources.allIDs[index], result.data])
              .filter((el) => el[1] != null),
          ),
          allIDs: results
            .map((result, index) => [dataSources.allIDs[index], result.data])
            .filter((el) => el[1] != null)
            .map((el) => el[0]),
        },
        pending: results.some((result) => result.isPending),
      };
    },
  };

  return useQueries(queryOptions) as DataCacheResult;
}
