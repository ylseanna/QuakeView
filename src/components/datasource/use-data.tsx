import { useQueries, UseQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";

import { useProjectStore } from "@/providers/project-store-provider";
import { useAppStateStore } from "@/providers/app-state-provider";
import { fetchData } from "./load-data";
import { DataSourceFiltering, Earthquake, Extent } from "./types";

export type DataQueryResponse = {
  data: Earthquake[];
  addedVars: string[];
  bounds: { [variable: string]: [number, number] | null };
  unfiltered_bounds: { [variable: string]: [number, number] | null };
  extent: Extent;
  filters: DataSourceFiltering;
};

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

export function useCatalogData() {
  const dataSources = useProjectStore((state) => state.dataSources);

  const { setQueryStatus, checkQueryStatusPresent } = useAppStateStore(
    (state) => state.appInterfaceActions,
  );

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
        results: results.map((result, index) => ({
          dataSourceID: dataSources.allIDs[index],
          result: result,
        })),

        pending: results.some((result) => result.isPending),
      };
    },
  };

  const queries = useQueries(queryOptions);

  useEffect(() => {
    queries.results.forEach(
      (queryResult: {
        dataSourceID: string;
        result: UseQueryResult<DataQueryResponse, Error>;
      }) => {
        const { isLoading, isFetching, isSuccess, error } = queryResult.result;
        setQueryStatus({
          dataSourceID: queryResult.dataSourceID,
          isLoading: isLoading,
          isFetching: isFetching,
          isSucces: isSuccess,
          error: error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
                cause: error.cause,
              }
            : null,
        });
      },
    );

    checkQueryStatusPresent(
      queries.results.map((result) => result.dataSourceID),
    );
  }, [queries]);

  return { data: queries.data, pending: queries.pending } as DataCacheResult;
}
