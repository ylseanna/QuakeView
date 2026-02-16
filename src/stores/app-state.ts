import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { merge } from "lodash";

// import { DataSourceFiltering, EarthQuake, Extent } from "../components/datasource/types";

export type AppState = {
  appInterface: {
    mapToolsVisible: boolean;
    sideBarsVisible: boolean;
    animationControlsVisible: boolean;
    timelineBarVisible: boolean;
    legendVisible: boolean;
    popperOpen: boolean;
  };
};

export type AppActions = {
  appInterfaceActions: {
    toggleMapToolsVisible: () => void;
    toggleSideBarsVisible: () => void;
    toggleAnimationControlsVisible: () => void;
    toggleTimelineBarVisible: () => void;
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
    animationControlsVisible: true,
    timelineBarVisible: false,
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
          toggleAnimationControlsVisible: () =>
            set((state) => {
              state.appInterface.animationControlsVisible =
                !state.appInterface.animationControlsVisible;
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
