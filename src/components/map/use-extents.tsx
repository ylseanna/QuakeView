import bboxPolygon from "@turf/bbox-polygon";
import { featureCollection } from "@turf/helpers";
import { bbox } from "@turf/bbox";
import { Feature, GeoJsonProperties, Polygon } from "geojson";
import { useMemo } from "react";

import { useCatalogData } from "@/components/data/use-data";
import { combineBounds } from "../data/catalog-util";

export function useExtentPolygons() {
  const { data } = useCatalogData();

  const extentPolygons = useMemo(() => {
    const array = data.allIDs
      .map((dataSourceID) => {
        if (data.byID[dataSourceID].extent) {
          return [
            dataSourceID,
            bboxPolygon(data.byID[dataSourceID].extent.bounds),
          ] as [string, Feature<Polygon, GeoJsonProperties>];
        } else [dataSourceID, null] as [string, null];
      })
      .filter((el) => el![1]) as [
      string,
      Feature<Polygon, GeoJsonProperties>,
    ][];

    if (array) {
      return Object.fromEntries(array);
    } else {
      return {};
    }
  }, [data.allIDs, data.byID]);

  const overallExtent = useMemo(
    () =>
      bboxPolygon(bbox(featureCollection([...Object.values(extentPolygons)]))),
    [extentPolygons],
  );

  return { main: overallExtent, byID: extentPolygons };
}

export function useExtents(type: "twoD" | "threeD" = "twoD") {
  const { data } = useCatalogData();

  const extentsByID = useMemo(() => {
    if (data.allIDs) {
      const array = data.allIDs
        .map((dataSourceID) => {
          if (data.byID[dataSourceID].extent) {
            if (type == "twoD") {
              return [dataSourceID, data.byID[dataSourceID].extent.bounds];
            } else if (type == "threeD") {
              return [
                dataSourceID,
                [
                  data.byID[dataSourceID].extent.bounds[0],
                  data.byID[dataSourceID].extent.bounds[1],
                  data.byID[dataSourceID].bounds["dep"]![0],
                  data.byID[dataSourceID].extent.bounds[2],
                  data.byID[dataSourceID].extent.bounds[3],
                  data.byID[dataSourceID].bounds["dep"]![1],
                ],
              ];
            } else {
              return [dataSourceID, null];
            }
          } else {
            return [dataSourceID, null];
          }
        })
        .filter((el) => el[1]);

      if (array) {
        return Object.fromEntries(array) as {
          [id: string]:
            | [number, number, number, number]
            | [number, number, number, number, number, number];
        };
      } else {
        return {} as {
          [id: string]:
            | [number, number, number, number]
            | [number, number, number, number, number, number];
        };
      }
    } else {
      return {} as {
        [id: string]:
          | [number, number, number, number]
          | [number, number, number, number, number, number];
      };
    }
  }, [data.allIDs, data.byID]);

  const overallExtent = useMemo(() => {
    if (data.allIDs.length > 0) {
      const combinedBounds = combineBounds(
        data.allIDs.map((dataSourceID) => data.byID[dataSourceID].bounds),
      );

      if (combinedBounds) {
        if (type == "twoD") {
          return [
            combinedBounds["lon"]![0],
            combinedBounds["lat"]![0],
            combinedBounds["lon"]![1],
            combinedBounds["lat"]![1],
          ];
        } else if (type == "threeD") {
          return [
            combinedBounds["lon"]![0],
            combinedBounds["lat"]![0],
            combinedBounds["dep"]![0],
            combinedBounds["lon"]![1],
            combinedBounds["lat"]![1],
            combinedBounds["dep"]![1],
          ];
        } else {
          return null;
        }
      }
    } else {
      return null;
    }
  }, [data.allIDs, data.byID]);

  return {
    main: overallExtent! as
      | [number, number, number, number]
      | [number, number, number, number, number, number]
      | null,
    byID: extentsByID,
  };
}

export function useCentroids() {
  const { data } = useCatalogData();

  const extentsByID = useMemo(() => {
    if (data.allIDs) {
      const array = data.allIDs
        .map((dataSourceID) => {
          if (data.byID[dataSourceID].extent) {
            return [dataSourceID, data.byID[dataSourceID].extent.centroid];
          } else {
            return [dataSourceID, null];
          }
        })
        .filter((el) => el[1]);

      if (array) {
        return Object.fromEntries(array) as {
          [id: string]: [number, number, number];
        };
      } else {
        return {} as {
          [id: string]: [number, number, number];
        };
      }
    } else {
      return {} as {
        [id: string]: [number, number, number];
      };
    }
  }, [data.allIDs, data.byID]);

  const overallCentroid = useMemo(() => {
    if (data.allIDs.length > 0) {
      const allCentroids = data.allIDs.map(
        (dataSourceID) => data.byID[dataSourceID].extent.centroid,
      );
      return [
        allCentroids
          .map((centroid) => centroid[0])
          .reduce((total, num) => total + num, 0) / allCentroids.length,
        allCentroids
          .map((centroid) => centroid[1])
          .reduce((total, num) => total + num, 0) / allCentroids.length,
        allCentroids
          .map((centroid) => centroid[2])
          .reduce((total, num) => total + num, 0) / allCentroids.length,
      ];
    } else {
      return null;
    }
  }, [data.allIDs, data.byID]);

  return {
    main: overallCentroid! as [number, number, number] | null,
    byID: extentsByID,
  };
}
