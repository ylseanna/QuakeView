export type BoundsDict = { [variable: string]: [number, number] | null };

export const CombineBounds = (boundsDicts: BoundsDict[]) => {
  return Object.fromEntries(
    Object.keys(boundsDicts).map((variable) => {
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

// const minY = Math.min(
//           ...data.allIDs.map((id) => data.byID[id]!.bounds["mag"]![0]),
//         );
//         const maxY = Math.max(
//           ...data.allIDs.map((id) => data.byID[id]!.bounds["mag"]![1]),
//         );
