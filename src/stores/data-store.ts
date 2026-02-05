import { immer } from "zustand/middleware/immer";
import { createStore } from "zustand/vanilla";

import { DataSourceFiltering, EarthQuake, Extent } from "../components/datasource/types";

export type DataState = {
  data: {
    [id: string]: {
      data: EarthQuake[];
      addedVars: string[];
      bounds: { [variable: string]: [number, number] | null };
      extent: Extent;
      filters: DataSourceFiltering;
    };
  };
  allIDs: string[];
};

export type DataActions = {
  addData: (
    id: string,
    data: EarthQuake[],
    addedVars: string[],
    bounds: { [variable: string]: [number, number] | null },
    extent: Extent,
    filters: DataSourceFiltering,
  ) => void;
  removeData: (id: string) => void;
};

export type DataStore = DataState & DataActions;

export const defaultInitState: DataState = { data: {}, allIDs: [] };

export const createDataStore = (initState: DataState = defaultInitState) => {
  return createStore<DataStore>()(
    immer((set) => ({
      ...initState,
      addData: (id, data, addedVars, dataBounds, extent, filters) =>
        set((state) => {
          state.data[id] = {
            data: data,
            addedVars: addedVars,
            bounds: dataBounds,
            extent: extent,
            filters: filters,
          };
          state.allIDs.push(id);
        }),
      removeData: (id) =>
        set((state) => {
          delete state.data[id];
          state.allIDs.splice(
            state.allIDs.findIndex((iid) => iid === id),
            1,
          );
        }),
    })),
  );
};
