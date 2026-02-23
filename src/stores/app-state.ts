import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { merge } from "lodash";

// import { DataSourceFiltering, Earthquake, Extent } from "../components/datasource/types";

export type AppState = {
  appInterface: {
    mapToolsVisible: boolean;
    sideBarsVisible: boolean;
    bottombarVisible: boolean;
    timelineBarVisible: boolean;
    sidebarOpen: "formatting" | "filtering" | "layers" | null;
    legendVisible: boolean;
    popperOpen: boolean;
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
