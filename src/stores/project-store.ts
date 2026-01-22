import { immer } from "zustand/middleware/immer";
import { ViewState } from "react-map-gl/maplibre";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { merge } from "lodash";

import { DataSourceDataDescription, DataSourceFormatting } from "./../components/datasource/types";
import { DataSource } from "@/components/datasource/types";

export type ProjectState = {
  sessionInterface: SessionInterface;
  GPUfiltering: GPU_filtering;
  dataSources: {
    byID: { [InternalID: string]: DataSource };
    allIDs: string[];
  };
};

export type SessionInterface = {
  overViewState: ViewState;
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
  interfaceActions: {
    setOverViewState: (value: ViewState) => void;
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
  dataSourceActions: {
    addDataSource: (dataSource: DataSource) => void;
    removeDataSource: (id: string) => void;
    setFormatting: (
      id: string,
      keyToModify: keyof DataSourceFormatting,
      value: never,
    ) => void;
    setFiltering: (
      id: string,
      variableToModify: string,
      value: [number, number] | null,
    ) => void;
    setVariableDescr: (
      id: string,
      variableToModify: string,
      keyToModify: keyof DataSourceDataDescription,
      value: never,
    ) => void;
    setAddedVars: (id: string, value: string[]) => void;
    setVisible: (id: string, value: boolean) => void;
    setLoadable: (id: string, value: boolean) => void;
  };
};

export type ProjectStore = ProjectState & ProjectActions;

export const defaultInitState: ProjectState = {
  sessionInterface: {
    overViewState: {
      longitude: -19,
      latitude: 65,
      zoom: 6,
      pitch: 0,
      bearing: 0,
      padding: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
    },
    pickable: false,
    animation: { tapered: false, speed: { multiplier: 1, unit: "day" } },
  },
  GPUfiltering: { t: [0, 2147483647 * 1000], mag: [-100, 100] },
  dataSources: { byID: {}, allIDs: [] },
};

export const createProjectStore = (
  initState: ProjectState = defaultInitState,
) => {
  return createStore<ProjectStore>()(
    persist(
      immer((set) => ({
        ...initState,
        interfaceActions: {
          setOverViewState: (value) =>
            set((state) => {
              state.sessionInterface.overViewState = value;
            }),
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
        dataSourceActions: {
          addDataSource: (dataSource) =>
            set((state) => {
              state.dataSources.byID[dataSource.internal_id] = dataSource;
              state.dataSources.allIDs.push(dataSource.internal_id);
            }),
          removeDataSource: (id) =>
            set((state) => {
              delete state.dataSources.byID[id];
              state.dataSources.allIDs.splice(
                state.dataSources.allIDs.findIndex((iid) => iid === id),
                1,
              );
            }),
          setFormatting: (id, keyToModify, value) =>
            set((state) => {
              state.dataSources.byID[id].formatting[keyToModify] = value;
            }),
          setFiltering: (id, keyToModify, value) =>
            set((state) => {
              if (value) {
                state.dataSources.byID[id].filtering[keyToModify] = value;
              } else {
                delete state.dataSources.byID[id].filtering[keyToModify];
              }
            }),
          setVariableDescr: (id, variableToModify, keyToModify, value) =>
            set((state) => {
              state.dataSources.byID[id].metadata.variables.by_id[
                variableToModify
              ][keyToModify] = value;
            }),
          setAddedVars: (id, value) =>
            set((state) => {
              state.dataSources.byID[id].metadata.variables.added_vars = value;
            }),
          setVisible: (id, value) =>
            set((state) => {
              state.dataSources.byID[id].interface.visible = value;
            }),
          setLoadable: (id, value) =>
            set((state) => {
              state.dataSources.byID[id].interface.loadable = value;
            }),
        },
      })),
      {
        name: "project-session",
        merge: (persistedState, currentState) => {
          return merge({}, currentState, persistedState);
        },
      },
    ),
  );
};
