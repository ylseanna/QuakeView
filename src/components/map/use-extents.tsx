import bboxPolygon from "@turf/bbox-polygon";
import { featureCollection } from "@turf/helpers";
import { bbox } from "@turf/bbox";
import { Feature, GeoJsonProperties, Polygon } from "geojson";
import { useMemo } from "react";

import { useCatalogData } from "@/components/data/use-data";

export default function useExtents() {
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
