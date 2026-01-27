import { immer } from "zustand/middleware/immer";
import { createStore } from "zustand/vanilla";

import { DataSourceFiltering, EarthQuake } from "../components/datasource/types";

export type DataState = {
  data: { [id: string]: { data: EarthQuake[]; addedVars: string[]; filters: DataSourceFiltering } };
};

export type DataActions = {
  addData: (id: string, addedData: EarthQuake[], addedVars: string[], addedFilters: DataSourceFiltering) => void;
  removeData: (id: string) => void;
};

export type DataStore = DataState & DataActions;

export const defaultInitState: DataState = { data: {} };

export const createDataStore = (initState: DataState = defaultInitState) => {
  return createStore<DataStore>()(
    immer((set) => ({
      ...initState,
      addData: (id, addedData, addedVars, addedFilters) =>
        set((state) => {
          state.data[id] = { data: addedData, addedVars: addedVars, filters: addedFilters };
        }),
      removeData: (id) =>
        set((state) => {
          delete state.data[id];
        }),
    }))
  );
};
