import { EarthQuake } from "../components/datasource/types";
import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";

export type DataState = {
  data: { [id: string]: { data: EarthQuake[]; addedVars: string[] } };
};

export type DataActions = {
  addData: (id: string, addedData: EarthQuake[], addedVars: string[]) => void;
  removeData: (id: string) => void;
};

export type DataStore = DataState & DataActions;

export const defaultInitState: DataState = { data: {} };

export const createDataStore = (initState: DataState = defaultInitState) => {
  return createStore<DataStore>()(
    immer((set) => ({
      ...initState,
      addData: (id, addedData, addedVars) =>
        set((state) => {
          state.data[id] = { data: addedData, addedVars: addedVars };
        }),
      removeData: (id) =>
        set((state) => {
          delete state.data[id];
        }),
    }))
  );
};
