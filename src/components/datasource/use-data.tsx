import { useQueries, UseQueryResult } from "@tanstack/react-query";
import { chunk } from "lodash";
import { useEffect, useMemo } from "react";

import { useProjectStore } from "@/providers/project-store-provider";
import { useAppStateStore } from "@/providers/app-state-provider";
import { QueryKeys } from "@/stores/app-state";
import { combineBounds, combineExtents } from "./catalog-util";
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
};

const combineQueryResponses = (
  chunkedDataA: DataQueryResponse,
  chunkedDataB: DataQueryResponse,
) => {
  const combinedResponse = {} as DataQueryResponse;

  // combine data
  combinedResponse.data = chunkedDataA.data.concat(chunkedDataB.data);

  // inherited properties (should be the same for both chunks), thus inherit from A
  combinedResponse.addedVars = chunkedDataA.addedVars;
  combinedResponse.filters = chunkedDataA.filters;

  // combine bounds
  combinedResponse.bounds = combineBounds([
    chunkedDataA.bounds,
    chunkedDataB.bounds,
  ]);
  combinedResponse.unfiltered_bounds = combineBounds([
    chunkedDataA.unfiltered_bounds,
    chunkedDataB.unfiltered_bounds,
  ]);

  // combine extents
  combinedResponse.extent = combineExtents([
    chunkedDataA.extent,
    chunkedDataB.extent,
  ]);

  return combinedResponse;
};

const aggregateData = (
  results: UseQueryResult<DataQueryResponse, Error>[],
  queryKeys: QueryKeys,
) => {
  const aggregatedData = { byID: {}, allIDs: [] } as DataCache;

  results.forEach((result, resultIndex) => {
    if (result.data != null) {
      if (queryKeys[resultIndex][3] == 1) {
        // check for non-chunked queries

        aggregatedData.byID[queryKeys[resultIndex][1]] = result.data;
        aggregatedData.allIDs.push(queryKeys[resultIndex][1]);
      } else if (queryKeys[resultIndex][3] > 1) {
        if (!aggregatedData.allIDs.includes(queryKeys[resultIndex][1])) {
          aggregatedData.byID[queryKeys[resultIndex][1]] = result.data;
          aggregatedData.allIDs.push(queryKeys[resultIndex][1]);
        } else {
          aggregatedData.byID[queryKeys[resultIndex][1]] =
            combineQueryResponses(
              aggregatedData.byID[queryKeys[resultIndex][1]],
              result.data,
            );
        }
      }
    }
  });
  return aggregatedData;
};

export function useCatalogData() {
  const dataSources = useProjectStore((state) => state.dataSources);

  const { queryKeys } = useAppStateStore((state) => state.appInterface);

  const { setQueryKeys, setQueryStatus, checkQueryStatusPresent } =
    useAppStateStore((state) => state.appInterfaceActions);

  useEffect(() => {
    if (dataSources) {
      const queryKeys = [
        ...dataSources.allIDs.map((dataSourceID) => {
          const chunkSize = 5e5;

          if (dataSources.byID[dataSourceID].metadata.num_events < chunkSize) {
            // filter for smaller catalogs, less than 500k
            return [
              [
                "catalog_data", // query identifier
                dataSourceID, // dataSource identifier
                0, // index of query
                1, // out off num queries for this dataSource
                [0, -1], // slice, included for readability
                {
                  filepath: dataSources.byID[dataSourceID].filepath,
                  filtering: dataSources.byID[dataSourceID].filtering,
                  variables:
                    dataSources.byID[dataSourceID].metadata.variables.by_id,
                  added_vars:
                    dataSources.byID[dataSourceID].metadata.variables
                      .added_vars,
                }, // options (reset the query when user changes options)
              ],
            ];
          } else {
            // larger catalogs subdivided in 500k chunks
            const numChunks = Math.ceil(
              dataSources.byID[dataSourceID].metadata.num_events / chunkSize,
            );

            let perDataSourceKeys = [] as QueryKeys;
            for (let i = 0; i < numChunks; i++) {
              perDataSourceKeys.push([
                "catalog_data", // query identifier
                dataSourceID, // dataSource identifier
                i, // index of query
                numChunks, // out off num queries for this dataSource
                [
                  i * chunkSize,
                  (i + 1) * chunkSize <
                  dataSources.byID[dataSourceID].metadata.num_events
                    ? (i + 1) * chunkSize
                    : -1,
                ], // slice
                {
                  filepath: dataSources.byID[dataSourceID].filepath,
                  filtering: dataSources.byID[dataSourceID].filtering,
                  variables:
                    dataSources.byID[dataSourceID].metadata.variables.by_id,
                  added_vars:
                    dataSources.byID[dataSourceID].metadata.variables
                      .added_vars,
                }, // options (reset the query when user changes options)
              ]);
            }

            return perDataSourceKeys;
          }
        }),
      ].flat();

      setQueryKeys(queryKeys as QueryKeys);
    }
  }, [dataSources]);

  const queryOptions = {
    queries: queryKeys.map((queryKey) => {
      return {
        queryKey: queryKey,
        queryFn: () => fetchData(dataSources.byID[queryKey[1]], queryKey[4]),
        enabled: dataSources.byID[queryKey[1]]
          ? dataSources.byID[queryKey[1]].interface.loadable
          : false,
      };
    }),
    combine: (results: UseQueryResult<DataQueryResponse, Error>[]) => {
      return {
        results: results,
      };
    },
  };

  const queries = useQueries(queryOptions);

  useEffect(() => {
    queries.results.forEach(
      (result: UseQueryResult<DataQueryResponse, Error>, index) => {
        const { isLoading, isFetching, isSuccess, error } = result;
        setQueryStatus({
          dataSourceID: queryKeys[index][1],
          index: queryKeys[index][2],
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

    checkQueryStatusPresent(queryKeys.map((key) => key[1]));
  }, [queries]);

  const data = useMemo(
    () => aggregateData(queries.results, queryKeys),
    [queries],
  );

  return { data: data } as DataCacheResult;
}
