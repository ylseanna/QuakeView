import { createStore } from "zustand/vanilla";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { merge } from "lodash";
import { DataSource } from "@/components/datasource/types";

export type ProjectState = {
  count: number;
  sessionInterface: SessionInterface;
  GPUfiltering: GPU_filtering;
  dataSources: {
    byID: { [InternalID: string]: DataSource };
    allIDs: string[];
  };
};

export type SessionInterface = {
  pickable: boolean;
  animation: {
    tapered: boolean;
    speed: {
      multiplier: number;
      unit: "second" | "minute" | "hour" | "day" | "week" | "year";
    };
  };
};

export type GPU_filtering = {
  t: [number | null, number | null];
  mag: [number | null, number | null];
};

export type ProjectActions = {
  countActions: {
    decrementCount: () => void;
    incrementCount: () => void;
  };
  interfaceActions: {
    setPickable: (value: boolean) => void;
    animation: {
      setTapered: (value: boolean) => void;
      setSpeed: (value: {
        multiplier: number;
        unit: "second" | "minute" | "hour" | "day" | "week" | "year";
      }) => void;
    };
  };
  GPUfilteringActions: {
    setTimeFiltering: (value: [number, number]) => void;
    setMagFiltering: (value: [number, number]) => void;
  };
};

export type ProjectStore = ProjectState & ProjectActions;

export const defaultInitState: ProjectState = {
  count: 0,
  sessionInterface: {
    pickable: true,
    animation: { tapered: false, speed: { multiplier: 1, unit: "day" } },
  },
  GPUfiltering: { t: [0, 2147483647], mag: [-100, 100] },
};

export const createProjectStore = (
  initState: ProjectState = defaultInitState
) => {
  return createStore<ProjectStore>()(
    persist(
      immer((set) => ({
        ...initState,
        countActions: {
          decrementCount: () => set((state) => ({ count: state.count - 1 })),
          incrementCount: () => set((state) => ({ count: state.count + 1 })),
        },
        interfaceActions: {
          setPickable: (value) =>
            set((state) => {
              state.sessionInterface.pickable = value;
            }),
          animation: {
            setTapered: (value) =>
              set((state) => {
                state.sessionInterface.animation.tapered = value;
              }),
            setSpeed: (value) =>
              set((state) => {
                state.sessionInterface.animation.speed = value;
              }),
          },
        },
        GPUfilteringActions: {
          setTimeFiltering: (value) =>
            set((state) => {
              state.GPUfiltering.t = value;
            }),
          setMagFiltering: (value) =>
            set((state) => {
              state.GPUfiltering.mag = value;
            }),
        },
      })),
      {
        name: "project-session",
        merge: (persistedState, currentState) => {
          return merge({}, currentState, persistedState);
        },
      }
    )
  );
};
