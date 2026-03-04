import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { merge } from "lodash";

import { DataSourceDataDescription, DataSourceFiltering } from "@/components/datasource/types";

// import { DataSourceFiltering, Earthquake, Extent } from "../components/datasource/types";

export type ErrorObject = {
  message: string;
  stack: string | undefined;
  name: string;
  cause: unknown;
};

export type QueryMonitor = {
  dataSourceID: string;
  index: number;
  isLoading: boolean;
  isFetching: boolean;
  isSucces: boolean;
  error: null | ErrorObject;
};

export type QueryKeys = [
  string,
  string,
  number,
  number,
  [number, number],
  {
    filepath: string;
    filtering: DataSourceFiltering;
    variables: {
      [variable: string]: DataSourceDataDescription;
    };
    added_vars: string[];
  },
][];

export type AppState = {
  appInterface: {
    mapToolsVisible: boolean;
    sideBarsVisible: boolean;
    bottombarVisible: boolean;
    timelineBarVisible: boolean;
    sidebarOpen: "formatting" | "filtering" | "layers" | null;
    legendVisible: boolean;
    popperOpen: boolean;
    queryKeys: QueryKeys;
    queryMonitors: {
      byKey: { [key: string]: { [index: string]: QueryMonitor } };
      allKeys: string[];
    };
  };
};

export type AppActions = {
  appInterfaceActions: {
    toggleMapToolsVisible: () => void;
    toggleSideBarsVisible: () => void;
    togglebottombarVisible: () => void;
    toggleTimelineBarVisible: () => void;
    setSidebarOpen: (
      value: "formatting" | "filtering" | "layers" | null,
    ) => void;
    toggleLegendVisible: () => void;
    signalPopperOpen: () => void;
    signalPopperClosed: () => void;
    setQueryKeys: (keys: QueryKeys) => void;
    setQueryStatus: (queryMonitor: QueryMonitor) => void;
    checkQueryStatusPresent: (dataSourceIDs: string[]) => void;
  };
};

export type AppStateStore = AppState & AppActions;

export const defaultInitState: AppState = {
  appInterface: {
    mapToolsVisible: true,
    sideBarsVisible: true,
    bottombarVisible: true,
    timelineBarVisible: false,
    sidebarOpen: null,
    legendVisible: true,
    popperOpen: false,
    queryKeys: [],
    queryMonitors: { byKey: {}, allKeys: [] },
  },
};

export const createAppStore = (initState: AppState = defaultInitState) => {
  return createStore<AppStateStore>()(
    persist(
      immer((set) => ({
        ...initState,
        appInterfaceActions: {
          toggleMapToolsVisible: () =>
            set((state) => {
              state.appInterface.mapToolsVisible =
                !state.appInterface.mapToolsVisible;
            }),
          toggleSideBarsVisible: () =>
            set((state) => {
              state.appInterface.sideBarsVisible =
                !state.appInterface.sideBarsVisible;
            }),
          togglebottombarVisible: () =>
            set((state) => {
              state.appInterface.bottombarVisible =
                !state.appInterface.bottombarVisible;
            }),
          toggleTimelineBarVisible: () =>
            set((state) => {
              state.appInterface.timelineBarVisible =
                !state.appInterface.timelineBarVisible;
            }),
          toggleLegendVisible: () =>
            set((state) => {
              state.appInterface.legendVisible =
                !state.appInterface.legendVisible;
            }),
          setSidebarOpen: (value) =>
            set((state) => {
              state.appInterface.sidebarOpen = value;
            }),
          signalPopperOpen: () =>
            set((state) => {
              state.appInterface.popperOpen = true;
            }),
          signalPopperClosed: () =>
            set((state) => {
              state.appInterface.popperOpen = false;
            }),
          setQueryKeys: (keys) =>
            set((state) => {
              state.appInterface.queryKeys = keys;
            }),
          setQueryStatus: (queryMonitor) =>
            set((state) => {
              if (
                !state.appInterface.queryMonitors.allKeys.includes(
                  queryMonitor.dataSourceID,
                )
              ) {
                state.appInterface.queryMonitors.byKey[
                  queryMonitor.dataSourceID
                ] = {};
                state.appInterface.queryMonitors.byKey[
                  queryMonitor.dataSourceID
                ][String(queryMonitor.index)] = queryMonitor;
                state.appInterface.queryMonitors.allKeys.push(
                  queryMonitor.dataSourceID,
                );
              } else {
                state.appInterface.queryMonitors.byKey[
                  queryMonitor.dataSourceID
                ][String(queryMonitor.index)] = queryMonitor;
              }
            }),
          checkQueryStatusPresent: (dataSourceIDs) =>
            set((state) => {
              state.appInterface.queryMonitors.allKeys.forEach(
                (queryMonitorKey) => {
                  if (!dataSourceIDs.includes(queryMonitorKey)) {
                    delete state.appInterface.queryMonitors.byKey[
                      queryMonitorKey
                    ];
                    const index =
                      state.appInterface.queryMonitors.allKeys.findIndex(
                        (iid) => iid === queryMonitorKey,
                      );
                    if (index > -1) {
                      // only splice array when item is found
                      state.appInterface.queryMonitors.allKeys.splice(index, 1);
                    }
                  }
                },
              );
            }),
        },
      })),
      {
        name: "app-state",
        merge: (persistedState, currentState) => {
          return merge({}, currentState, persistedState);
        },
      },
    ),
  );
};
