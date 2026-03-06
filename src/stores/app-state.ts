import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { merge } from "lodash";

import { DataSourceDataDescription, DataSourceFiltering } from "@/components/custom/types";

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
    views: {
      mapToolsVisible: boolean;
      sideBarsVisible: boolean;
      bottombarVisible: boolean;
      timelineBarVisible: boolean;
      sidebarOpen: "formatting" | "filtering" | "layers" | null;
      legendVisible: boolean;
      debugVisible: boolean;
      popperOpen: boolean;
    };
    queries: {
      queryKeys: QueryKeys;
      queryMonitors: {
        byKey: { [key: string]: { [index: string]: QueryMonitor } };
        allKeys: string[];
      };
    };
  };
};

export type AppActions = {
  appInterfaceActions: {
    viewActions: {
      toggleMapToolsVisible: () => void;
      toggleSideBarsVisible: () => void;
      togglebottombarVisible: () => void;
      toggleTimelineBarVisible: () => void;
      setSidebarOpen: (
        value: "formatting" | "filtering" | "layers" | null,
      ) => void;
      toggleLegendVisible: () => void;
      toggleDebugVisible: () => void;
      signalPopperOpen: () => void;
      signalPopperClosed: () => void;
    };
    queryActions: {
      setQueryKeys: (keys: QueryKeys) => void;
      setQueryStatus: (queryMonitor: QueryMonitor) => void;
      checkQueryStatusPresent: (dataSourceIDs: string[]) => void;
    };
  };
};

export type AppStateStore = AppState & AppActions;

export const defaultInitState: AppState = {
  appInterface: {
    views: {
      mapToolsVisible: true,
      sideBarsVisible: true,
      bottombarVisible: true,
      timelineBarVisible: false,
      sidebarOpen: null,
      legendVisible: true,
      debugVisible: false,
      popperOpen: false,
    },
    queries: {
      queryKeys: [],
      queryMonitors: { byKey: {}, allKeys: [] },
    },
  },
};

export const createAppStore = (initState: AppState = defaultInitState) => {
  return createStore<AppStateStore>()(
    persist(
      immer((set) => ({
        ...initState,
        appInterfaceActions: {
          viewActions: {
            toggleMapToolsVisible: () =>
              set((state) => {
                state.appInterface.views.mapToolsVisible =
                  !state.appInterface.views.mapToolsVisible;
              }),
            toggleSideBarsVisible: () =>
              set((state) => {
                state.appInterface.views.sideBarsVisible =
                  !state.appInterface.views.sideBarsVisible;
              }),
            togglebottombarVisible: () =>
              set((state) => {
                state.appInterface.views.bottombarVisible =
                  !state.appInterface.views.bottombarVisible;
              }),
            toggleTimelineBarVisible: () =>
              set((state) => {
                state.appInterface.views.timelineBarVisible =
                  !state.appInterface.views.timelineBarVisible;
              }),
            toggleLegendVisible: () =>
              set((state) => {
                state.appInterface.views.legendVisible =
                  !state.appInterface.views.legendVisible;
              }),
            toggleDebugVisible: () =>
              set((state) => {
                state.appInterface.views.debugVisible =
                  !state.appInterface.views.debugVisible;
              }),
            setSidebarOpen: (value) =>
              set((state) => {
                state.appInterface.views.sidebarOpen = value;
              }),
            signalPopperOpen: () =>
              set((state) => {
                state.appInterface.views.popperOpen = true;
              }),
            signalPopperClosed: () =>
              set((state) => {
                state.appInterface.views.popperOpen = false;
              }),
          },
          queryActions: {
            setQueryKeys: (keys) =>
              set((state) => {
                state.appInterface.queries.queryKeys = keys;
              }),
            setQueryStatus: (queryMonitor) =>
              set((state) => {
                if (
                  !state.appInterface.queries.queryMonitors.allKeys.includes(
                    queryMonitor.dataSourceID,
                  )
                ) {
                  state.appInterface.queries.queryMonitors.byKey[
                    queryMonitor.dataSourceID
                  ] = {};
                  state.appInterface.queries.queryMonitors.byKey[
                    queryMonitor.dataSourceID
                  ][String(queryMonitor.index)] = queryMonitor;
                  state.appInterface.queries.queryMonitors.allKeys.push(
                    queryMonitor.dataSourceID,
                  );
                } else {
                  state.appInterface.queries.queryMonitors.byKey[
                    queryMonitor.dataSourceID
                  ][String(queryMonitor.index)] = queryMonitor;
                }
              }),
            checkQueryStatusPresent: (dataSourceIDs) =>
              set((state) => {
                state.appInterface.queries.queryMonitors.allKeys.forEach(
                  (queryMonitorKey) => {
                    if (!dataSourceIDs.includes(queryMonitorKey)) {
                      delete state.appInterface.queries.queryMonitors.byKey[
                        queryMonitorKey
                      ];
                      const index =
                        state.appInterface.queries.queryMonitors.allKeys.findIndex(
                          (iid) => iid === queryMonitorKey,
                        );
                      if (index > -1) {
                        // only splice array when item is found
                        state.appInterface.queries.queryMonitors.allKeys.splice(
                          index,
                          1,
                        );
                      }
                    }
                  },
                );
              }),
          },
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
