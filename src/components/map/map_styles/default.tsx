import mask from "@turf/mask";

import type { MapStyle } from "react-map-gl/maplibre";

import calderas from "./geojsonfiles/calderas.geojson" with { type: "json" };
import coastline from "./geojsonfiles/coastline.geojson" with { type: "json" };
import centralvolc from "./geojsonfiles/centralvolc.geojson" with { type: "json" };
import joklar from "./geojsonfiles/joklar.geojson" with { type: "json" };
// import lakes from "./geojsonfiles/lakes.geojson" with { type: "json" };
// import thjodvegur from "./geojsonfiles/road1.geojson" with { type: "json" };

const ocean = mask(coastline);

export const IcelandDEMStyle: MapStyle = {
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
    // lakes: {
    //     type: "geojson",
    //     data: lakes,
    // },
    // thjodvegur: {
    //     type: "geojson",
    //     data: thjodvegur,
    // },
    // coast : {
    //   type: "geojson",
    //   data: coastline
    // }
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
    // {
    //     id: "lakes",
    //     type: "fill",
    //     source: "lakes",
    //     paint: {
    //       "fill-color": "#ffffff",
    //       "fill-opacity": 0.2,
    //     },
    //   },

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
    //   {
    //     id: "coast",
    //     type: "line",
    //     source: "coast",
    //     paint: {
    //       "line-color": "#000",
    //       "line-opacity" : 1,
    //       "line-width": 1.2
    //     },
    //   }
    // {
    //     id: "thjodvegur",
    //     type: "line",
    //     source: "thjodvegur",
    //     paint: {
    //       "line-color": "#000",
    //       "line-opacity": 0.3,
    //       "line-width": 0.8,
    //     },
    //   },
  ],
};

export const USDEMStyle: MapStyle = {
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
    // coastline: {
    //   type: "geojson",
    //   data: geoCountriesCoastline,
    // },
    // Hillshade%20Gray
    // "Provides a hillshaded surface generated dynamically using the hillshade server-side function on the elevation layer with a solar azimuth of 315 degrees and solar altitude of 45 degrees."
    // Aspect%20Map
    // "This server-side function will apply an on-the-fly process to the input elevation data to generate a color visualization of aspect."
    // Hillshade%20Elevation%20Tinted
    // "This server-side function will apply an on-the-fly process to the input elevation data to generate a tinted hillshade."
    // GreyHillshade_elevationFill
    // "Provides a hillshaded surface generated dynamically using the hillshade server-side function on the elevation layer, with the voids filled in. A solar azimuth of 315 degrees and solar altitude of 45 degrees has been applied."
    // Hillshade%20Multidirectional
    // "A raster function template."
    // Slope%20Map
    // "This server-side function will apply an on-the-fly process to the input elevation data to generate a color visualization of slope, where flat surfaces are gray, shallow slopes are yellow, and steep slopes are red-brown."
    // ocean: {
    //   type: "geojson",
    //   data: ocean,
    // },
    // calderas: {
    //   type: "geojson",
    //   data: calderas,
    // },
    // centralvolc: {
    //   type: "geojson",
    //   data: centralvolc,
    // },
    // joklar: {
    //   type: "geojson",
    //   data: joklar,
    // },
    // lakes: {
    //     type: "geojson",
    //     data: lakes,
    // },
    // thjodvegur: {
    //     type: "geojson",
    //     data: thjodvegur,
    // },
    // coast : {
    //   type: "geojson",
    //   data: coastline
    // }
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
    // {
    //   id: "coastline",
    //   type: "line",
    //   source: "coastline",
    //   paint: {
    //     "line-color": "#000",
    //     "line-opacity": 0.87,
    //     // "line-dasharray": [2, 4],
    //     "line-width": 0.8,
    //   },
    // },
    // {
    //   id: "ocean",
    //   type: "fill",
    //   source: "ocean",
    //   paint: {
    //     "fill-color": "#ffffff",
    //     "fill-opacity": 1
    //   },
    // },
    // // fill layers
    // {
    //   id: "joklar",
    //   type: "fill",
    //   source: "joklar",
    //   paint: {
    //     "fill-color": "#ffffff",
    //     "fill-opacity": 0.5,
    //   },
    // },
    // {
    //     id: "lakes",
    //     type: "fill",
    //     source: "lakes",
    //     paint: {
    //       "fill-color": "#ffffff",
    //       "fill-opacity": 0.2,
    //     },
    //   },

    // line layers
    // {
    //   id: "calderas",
    //   type: "line",
    //   source: "calderas",
    //   paint: {
    //     "line-color": "#000",
    //     "line-opacity": 0.87,
    //     "line-dasharray": [6, 2],
    //     "line-width": 1,
    //   },
    // },
    // {
    //   id: "centralvolc",
    //   type: "line",
    //   source: "centralvolc",
    //   paint: {
    //     "line-color": "#000",
    //     "line-opacity": 0.87,
    //     "line-dasharray": [2, 4],
    //     "line-width": 0.8,
    //   },
    // },
    //   {
    //     id: "coast",
    //     type: "line",
    //     source: "coast",
    //     paint: {
    //       "line-color": "#000",
    //       "line-opacity" : 1,
    //       "line-width": 1.2
    //     },
    //   }
    // {
    //     id: "thjodvegur",
    //     type: "line",
    //     source: "thjodvegur",
    //     paint: {
    //       "line-color": "#000",
    //       "line-opacity": 0.3,
    //       "line-width": 0.8,
    //     },
    //   },
  ],
};
