import combine from "@turf/combine";
import { LayerSpecification, StyleSpecification } from "maplibre-gl";
import mask from "@turf/mask";
import { FeatureCollection, GeoJsonProperties, MultiPolygon } from "geojson";
import { useMemo } from "react";

import { useProjectStore } from "@/providers/project-store-provider";
import { useCatalogData } from "@/components/data/use-data";
import centralvolc from "@/json/centralvolc.geojson" with { type: "json" };
import coastline from "@/json/coastline.geojson" with { type: "json" };
import all_countries from "@/json/countries.geojson" with { type: "json" };
import calderas from "@/json/calderas.geojson" with { type: "json" };
import joklar from "@/json/joklar.geojson" with { type: "json" };
import { useExtentPolygons } from "./use-extents";

const ocean = mask(coastline);

const all_ocean = mask(
  combine(
    all_countries as FeatureCollection<MultiPolygon, GeoJsonProperties>,
  ) as FeatureCollection<MultiPolygon>,
);

export const IcelandDEMStyle: StyleSpecification = {
  version: 8,
  sources: {
    dem: {
      type: "raster",
      tiles: [
        "https://gis.lmi.is/mapcache/web-mercator/wms?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&crs=EPSG:3857&transparent=true&width=256&height=256&layers=DEM",
      ],
      tileSize: 256,
      attribution: "Náttúrufræðistofnun",
    },
    ocean: {
      type: "geojson",
      data: ocean,
    },
    calderas: {
      type: "geojson",
      data: calderas,
    },
    centralvolc: {
      type: "geojson",
      data: centralvolc,
    },
    joklar: {
      type: "geojson",
      data: joklar,
    },
  },
  layers: [
    // base
    {
      id: "wms-dem",
      type: "raster",
      source: "dem",
      paint: {
        "raster-opacity": 0.5,
      },
    },
    {
      id: "ocean",
      type: "fill",
      source: "ocean",
      paint: {
        "fill-color": "#ffffff",
        "fill-opacity": 1,
      },
    },
    // fill layers
    {
      id: "joklar",
      type: "fill",
      source: "joklar",
      paint: {
        "fill-color": "#ffffff",
        "fill-opacity": 0.5,
      },
    },
    // line layers
    {
      id: "calderas",
      type: "line",
      source: "calderas",
      paint: {
        "line-color": "#000",
        "line-opacity": 0.87,
        "line-dasharray": [6, 2],
        "line-width": 1,
      },
    },
    {
      id: "centralvolc",
      type: "line",
      source: "centralvolc",
      paint: {
        "line-color": "#000",
        "line-opacity": 0.87,
        "line-dasharray": [2, 4],
        "line-width": 0.8,
      },
    },
  ],
};

export const USDEMStyle: StyleSpecification = {
  version: 8,
  sources: {
    dem: {
      type: "raster",
      tiles: [
        "https://elevation.nationalmap.gov/arcgis/services/3DEPElevation/ImageServer/WMSServer?FORMAT=image/png32&TRANSPARENT=TRUE&VERSION=1.3.0&SERVICE=WMS&REQUEST=GetMap&LAYERS=3DEPElevation:Hillshade%20Multidirectional&STYLES=&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}",
      ],
      tileSize: 256,
      attribution: "USGS",
    },
    ocean: {
      type: "geojson",
      data: all_ocean,
    },
    countries: {
      type: "geojson",
      data: all_countries,
    },
  },
  layers: [
    // base
    {
      id: "wms-dem",
      type: "raster",
      source: "dem",
      paint: {
        "raster-opacity": 0.5,
      },
    },

    {
      id: "ocean",
      type: "fill",
      source: "ocean",
      paint: {
        "fill-color": "#ffffff",
        "fill-opacity": 1,
      },
    },
  ],
};

// GEBCO

export const WorldCoastLines: StyleSpecification = {
  version: 8,
  sources: {
    dem: {
      type: "raster",
      tiles: [
        "https://wms.gebco.net/mapserv?request=getMap&service=wms&version=1.3.0&FORMAT=image/png&LAYERS=GEBCO_LATEST&STYLE=default&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}",
      ],
      tileSize: 256,
      attribution: "BODC",
    },
    countries: {
      type: "geojson",
      data: all_countries,
    },
  },
  layers: [
    {
      id: "wms-dem",
      type: "raster",
      source: "dem",
      paint: {
        "raster-opacity": 1,
      },
    },
    {
      id: "countries",
      type: "line",
      source: "countries",
      paint: {
        "line-color": "#000",
        "line-opacity": 0.6,
        "line-width": 1,
      },
    },
  ],
};

export const IcelandGrunnkort: StyleSpecification = {
  version: 8,
  sources: {
    demplusbg: {
      type: "raster",
      tiles: [
        "https://gis.lmi.is/mapcache/web-mercator/wms?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&crs=EPSG:3857&transparent=true&width=256&height=256&layers=grunnkort",
      ],
      tileSize: 256,
      attribution: "Náttúrufræðistofnun",
    },
  },
  layers: [
    {
      id: "wms-dem-plus-bg",
      type: "raster",
      source: "demplusbg",
      paint: {
        "raster-opacity": 1,
      },
    },
  ],
};

export function useMapStyle() {
  const { mapStyle: selectedStyle, showExtents } = useProjectStore(
    (state) => state.sessionInterface.map,
  );

  const { main: mainExtent, byID: extentPolygons } = useExtentPolygons();

  const mapStyle = useMemo(() => {
    const mapStyle =
      selectedStyle == "Iceland"
        ? IcelandDEMStyle
        : selectedStyle == "US"
          ? USDEMStyle
          : selectedStyle == "Iceland_base_map"
            ? IcelandGrunnkort
            : WorldCoastLines;

    return mapStyle;
  }, [selectedStyle, extentPolygons, showExtents]);

  return { mapStyle: mapStyle } as { mapStyle: StyleSpecification };
}

export function useExtentLayers() {
  const { mapStyle: selectedStyle, showExtents } = useProjectStore(
    (state) => state.sessionInterface.map,
  );

  const { main: mainExtent, byID: extentPolygons } = useExtentPolygons();

  const extentLayers = useMemo(() => {
    const layers = {} as { [id: string]: LayerSpecification };

    if (extentPolygons) {
      Object.keys(extentPolygons).forEach((dataSourceID) => {
        if (extentPolygons[dataSourceID]) {
          if (!Object.keys(layers).includes("extent-" + dataSourceID)) {
            layers["extent-" + dataSourceID] = {
              id: "extent-" + dataSourceID,
              type: "line",
              source: "extent-source-" + dataSourceID,
              paint: {
                "line-color": "#000",
                "line-opacity": 1,
                "line-width": 1.2,
              },
            };
          }
        }
      });

      if (mainExtent) {
        if (extentPolygons) {
          if (!Object.keys(layers).includes("mainExtent")) {
            layers["mainExtent"] = {
              id: "mainExtent",
              type: "line",
              source: "mainExtent",
              paint: {
                "line-dasharray": [1, 1],
                "line-color": "#000",
                "line-opacity": 1,
                "line-width": 1.2,
              },
            };
          }
        }
      }
    }
    return layers;
  }, [selectedStyle, extentPolygons, showExtents]);

  return extentLayers;
}
