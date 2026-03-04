import { Extent } from "./types";

export type BoundsDict = { [variable: string]: [number, number] | null };

export const combineBounds = (boundsDicts: BoundsDict[]) => {
  return Object.fromEntries(
    Object.keys(boundsDicts[0]).map((variable) => {
      return [
        variable,
        [
          Math.min(
            ...boundsDicts.map((boundsDict) => boundsDict[variable]![0]),
          ),
          Math.max(
            ...boundsDicts.map((boundsDict) => boundsDict[variable]![1]),
          ),
        ],
      ];
    }),
  ) as BoundsDict;
};

export const combineExtents = (Extents: Extent[]) => {
  const combinedExtent = {} as Extent;

  // combine centroid (mean of means)
  combinedExtent.centroid = [
    Extents.map((Extent) => Extent.centroid[0]).reduce(
      (total, num) => total + num,
      0,
    ) / Extents.length,
    Extents.map((Extent) => Extent.centroid[1]).reduce(
      (total, num) => total + num,
      0,
    ) / Extents.length,
    Extents.map((Extent) => Extent.centroid[2]).reduce(
      (total, num) => total + num,
      0,
    ) / Extents.length,
  ];

  // combine bounds
  combinedExtent.bounds = [
    Math.min(...Extents.map((Extent) => Extent.bounds[0])),
    Math.min(...Extents.map((Extent) => Extent.bounds[1])),
    Math.max(...Extents.map((Extent) => Extent.bounds[2])),
    Math.max(...Extents.map((Extent) => Extent.bounds[3])),
  ];

  return combinedExtent;
};

// const minY = Math.min(
//           ...data.allIDs.map((id) => data.byID[id]!.bounds["mag"]![0]),
//         );
//         const maxY = Math.max(
//           ...data.allIDs.map((id) => data.byID[id]!.bounds["mag"]![1]),
//         );
