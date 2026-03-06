import { immer } from "zustand/middleware/immer";
import { ViewState } from "react-map-gl/maplibre";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { merge } from "lodash";

import { DataSourceColorFormatting, DataSourceDataDescription, DataSourceFormatting, DataSourceMetaData } from "../components/custom/types";
import { DataSource } from "@/components/custom/types";

export type ProjectState = {
  sessionInterface: SessionInterface;
  GPUfiltering: GPU_filtering;
  dataSources: {
    byID: { [InternalID: string]: DataSource };
    allIDs: string[];
  };
};

export type SessionInterface = {
  pickable: boolean;
  table: {
    dataSourceID: string | null;
  };
  map: {
    mapViewState: ViewState;
    mapStyle: string;
    showExtents: boolean;
    zoomTo: string | null;
  };
  animation: {
    timeline: {
      enabled: boolean;
      isPlaying: "playing" | "paused" | "stopped";
      tapered: boolean;
      speed: {
        multiplier: number;
        unit: "second" | "minute" | "hour" | "day" | "week" | "year";
      };
    };
  };
};

export type GPU_filtering = {
  t: [number | null, number | null];
  mag: [number | null, number | null];
};

export type ProjectActions = {
  interfaceActions: {
    setPickable: (value: boolean) => void;
    table: {
      setDataSourceID: (id: string | null) => void;
    };
    map: {
      setMapViewState: (value: ViewState) => void;
      setMapStyle: (style: string) => void;
      toggleExtents: () => void;
      setZoomToTarget: (target: string | null) => void;
    };
    animation: {
      timeline: {
        toggleEnabled: () => void;
        setIsPlaying: (value: "playing" | "paused" | "stopped") => void;
        setTapered: (value: boolean) => void;
        setSpeed: (value: {
          multiplier: number;
          unit: "second" | "minute" | "hour" | "day" | "week" | "year";
        }) => void;
      };
    };
  };
  GPUfilteringActions: {
    setTimeFiltering: (value: [number, number]) => void;
    setMagFiltering: (value: [number, number]) => void;
  };
  dataSourceActions: {
    addDataSource: (dataSource: DataSource) => void;
    removeDataSource: (id: string) => void;
    setName: (id: string, value: string) => void;
    setMetadata: (id: string, value: DataSourceMetaData) => void;
    setFormatting: (
      id: string,
      type: "twoD" | "threeD" | "plot",
      keyToModify: keyof DataSourceFormatting,
      value: never,
    ) => void;
    setColorFormatting: (
      id: string,
      type: "twoD" | "threeD" | "plot",
      value: DataSourceColorFormatting,
    ) => void;
    setFilter: (
      id: string,
      variableToModify: string,
      value: [number, number],
    ) => void;
    removeFilter: (id: string, variableToModify: string) => void;
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
  metadataActions: {
    setIndex: (id: string, value: "from_file" | "numerical") => void;
    setSep: (id: string, value: string) => void;
    setDatetimeFormat: (id: string, value: string) => void;
    clearAllVariableMaps: (id: string) => void;
  };
};

export type ProjectStore = ProjectState & ProjectActions;

export const defaultInitState: ProjectState = {
  sessionInterface: {
    pickable: false,
    map: {
      mapStyle: "Iceland",
      mapViewState: {
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
      showExtents: true,
      zoomTo: null,
    },
    table: {
      dataSourceID: null,
    },
    animation: {
      timeline: {
        enabled: false,
        isPlaying: "stopped",
        tapered: false,
        speed: { multiplier: 1, unit: "day" },
      },
    },
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
          setPickable: (value) =>
            set((state) => {
              state.sessionInterface.pickable = value;
            }),
          table: {
            setDataSourceID: (id) =>
              set((state) => {
                state.sessionInterface.table.dataSourceID = id;
              }),
          },
          map: {
            setMapViewState: (value) =>
              set((state) => {
                state.sessionInterface.map.mapViewState = value;
              }),
            setMapStyle: (style) =>
              set((state) => {
                state.sessionInterface.map.mapStyle = style;
              }),
            toggleExtents: () =>
              set((state) => {
                state.sessionInterface.map.showExtents =
                  !state.sessionInterface.map.showExtents;
              }),
            setZoomToTarget: (target) =>
              set((state) => {
                state.sessionInterface.map.zoomTo = target;
              }),
          },
          animation: {
            timeline: {
              toggleEnabled: () =>
                set((state) => {
                  state.sessionInterface.animation.timeline.enabled =
                    !state.sessionInterface.animation.timeline.enabled;
                }),
              setIsPlaying: (value) =>
                set((state) => {
                  state.sessionInterface.animation.timeline.isPlaying = value;
                }),
              setTapered: (value) =>
                set((state) => {
                  state.sessionInterface.animation.timeline.tapered = value;
                }),
              setSpeed: (value) =>
                set((state) => {
                  state.sessionInterface.animation.timeline.speed = value;
                }),
            },
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
          setName: (id, value) =>
            set((state) => {
              state.dataSources.byID[id].name = value;
            }),
          setMetadata: (id, value) =>
            set((state) => {
              state.dataSources.byID[id].metadata = value;
            }),
          setFormatting: (id, type, keyToModify, value) =>
            set((state) => {
              state.dataSources.byID[id].formatting[type][keyToModify] = value;
            }),
          setColorFormatting: (id, type, value) =>
            set((state) => {
              state.dataSources.byID[id].formatting[type].color = value;
            }),
          setFilter: (id, keyToModify, value) =>
            set((state) => {
              state.dataSources.byID[id].filtering[keyToModify] = value;
            }),
          removeFilter: (id, keyToModify) =>
            set((state) => {
              delete state.dataSources.byID[id].filtering[keyToModify];
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
        metadataActions: {
          setSep: (id, value) =>
            set((state) => {
              state.dataSources.byID[id].metadata.sep = value;
            }),
          setIndex: (id, value) =>
            set((state) => {
              state.dataSources.byID[id].metadata.index = value;
            }),
          setDatetimeFormat: (id, value) =>
            set((state) => {
              state.dataSources.byID[id].metadata.datetime_format = value as
                | "parseable_datetime_string"
                | "year-month-day-hour-minute-second";
            }),
          clearAllVariableMaps: (id) =>
            set((state) => {
              Object.keys(
                state.dataSources.byID[id].metadata.variables.by_id,
              ).forEach((key) => {
                state.dataSources.byID[id].metadata.variables.by_id[
                  key
                ].mapped_var = [];
              });
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
