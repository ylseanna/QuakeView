"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useMemo, useRef, useState } from "react";
import { Earthquake, Extent } from "@/components/custom/types";

import DeckGL, { FullscreenWidget, ZoomWidget } from "@deck.gl/react";
import "@deck.gl/widgets/stylesheet.css";
import {
  FlyToInterpolator,
  MapView,
  MapViewState,
  PickingInfo,
} from "@deck.gl/core";
import { Button } from "@mui/material";
import { generateDataSourceMapLayers } from "./generate-datasource-layers";
import MapToolTip from "./map-tooltip";
import { useProjectStore } from "@/providers/project-store-provider";
import { ScatterplotLayer } from "deck.gl";
import { DataFilterExtensionProps } from "@deck.gl/extensions";
import{ useCatalogData } from "../data/use-data";
import { useAppStateStore } from "@/providers/app-state-provider";

// import { GeoJsonLayer } from "@deck.gl/layers";
// import { TerrainLayer } from "@deck.gl/geo-layers";
// import { MaskExtension } from "@deck.gl/extensions";
// import { TerrainLoader } from "@loaders.gl/terrain";

// import { GeoJsonLayer } from "@deck.gl/layers";

import {Deck} from '@deck.gl/core';
import {TerrainLayer} from '@deck.gl/geo-layers';
import {OBJLoader} from '@loaders.gl/obj';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {QuantizedMeshLoader} from '@loaders.gl/terrain';
import {load, parse} from '@loaders.gl/core';
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {Geometry} from "@luma.gl/engine";

import {CubeGeometry} from '@luma.gl/engine';

import {PlaneGeometry} from '@luma.gl/engine';

const dem_metadata = await fetch("/api/dem_metadata?filepath=/home/gab28/DATA/PhD/Data/DEMs/Tinitaly/w45050_s10/w45050_s10_repr.tif&verticalexag=5").then(
    (res) => {
      return res.json();
    },
  );


const extent = dem_metadata.extent

const options = {
  'quantized-mesh': {
    bounds: extent.bounds
  }
};



// console.log(mesh_data.quantized_mesh)
// const data = await load("/api/obj_data?filepath=/home/gab28/DATA/PhD/GitHub/QuakeView/liveserver_stuff/prototyping/test.obj", OBJLoader);
// // const data2 = await load(mesh_data.quantized_mesh, QuantizedMeshLoader, options);
const dem = await load("/api/quantized_data?filepath=/home/gab28/DATA/PhD/Data/DEMs/Tinitaly/w45050_s10/w45050_s10_repr.tif&verticalexag=5", QuantizedMeshLoader,options);


console.log(dem)

// const points = new Float32Array(mesh_data.points)
// const indices = new Uint16Array(mesh_data.indices)

// // console.log(points)
// // console.log(indices)
// console.log(data2)


// const dem= new Geometry({
//   attributes: {
//     positions: points,
//     indices: indices
//   },
//   topology: "triangle-list"

// });
// const lower_bounds = dem.header.boundingBox[0]
// const upper_bounds = dem.header.boundingBox[1]

// console.log(extent)

// const dem = new CubeGeometry()

// console.log(dem)

// const dem= new Geometry({
//   attributes: {
//     positions: new Float32Array([0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0])
//   }
// });


// console.log(plane)

// const terrainlayer = new TerrainLayer({
//   elevationDecoder: {
//     rScaler: 2,
//     gScaler: 0,
//     bScaler: 0,
//     offset: 0
//   },
//   // Digital elevation model from https://www.usgs.gov/
//   elevationData: '/api/mesh_data?filepath=/home/gab28/DATA/PhD/Data/DEMs/Tinitaly/w45050_s10/test.png',
//   texture: '',
//   bounds: [9.327893647604704, 40.801636788378, 9.421793782395296, 40.854169889622],
// });


const terrainlayer = new SimpleMeshLayer({
  id: 'SimpleMeshLayer',
  data: [dem],

  getColor:[128, 128, 128, 255],
  getScale:[1, 1, 1],
  // getTranslation:[0, 0, 0],

  mesh: dem,
  sizeScale: 100,
  wireframe:false,
  pickable: true,
});
console.log(terrainlayer)

interface DeckGLProps {
  extent: Extent | null;
  positionOffset: number;
}

export default function ThreeDDeckGLView({
  positionOffset,
}: DeckGLProps) {
  const INITIAL_VIEWSTATE = useMemo(
    () => ({
      longitude: extent ? extent.centroid[0] : 0,
      latitude: extent ? extent.centroid[1] : 0,
      zoom: 15,
      pitch: 0,
      bearing: 0,
      minZoom: 1,
      maxZoom: 20,
      maxPitch: 180,
      position: [0, 0, 0],
    }),
    [extent],
  );
  console.log(INITIAL_VIEWSTATE)
  const mapContainer = useRef<HTMLElement>(null);

  const sessionInterface = useProjectStore((state) => state.sessionInterface);
  const GPUfiltering = useProjectStore((state) => state.GPUfiltering);
  const dataSources = useProjectStore((state) => state.dataSources);

  const { data } = useCatalogData();

  useEffect(() => {
    mapContainer.current = document.getElementsByTagName("main")[0];
  }, [mapContainer]);

  // TOOLTIP

  const [hoverInfo, setHoverInfo] = useState<PickingInfo<Earthquake>>();

  // LAYERS
  const layers = useMemo(() => {
    let layers_to_set = [] as ScatterplotLayer<
      Earthquake,
      DataFilterExtensionProps
    >[];

    if (data) {
      layers_to_set = data.allIDs.map((id: string) => {
        const layer = generateDataSourceMapLayers(
          "threeD",
          dataSources.byID[id],
          data.byID[id].data,
          sessionInterface,
          GPUfiltering,
          positionOffset,
        );

        layer.onHover = (info: PickingInfo<Earthquake>) => {
          setHoverInfo(info);
          return true;
        };

        return layer;
      });
    }

    return layers_to_set;
  }, [
    // dataSources.allIDs,
    dataSources.byID,
    data,
    sessionInterface,
    GPUfiltering,
    positionOffset,
  ]);

  // VIEWSTATE & RESET VIEW
  const [initialViewState, setInitialViewState] =
    useState<MapViewState>(INITIAL_VIEWSTATE);

  const flyToDataSource = () => {
    setInitialViewState({
      ...INITIAL_VIEWSTATE,
      transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
      transitionDuration: "auto",
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setInitialViewState(INITIAL_VIEWSTATE));

  const deckRef = useRef(null);

  const { mapToolsVisible } = useAppStateStore((state) => state.appInterface.views);

  return (
    <>
      <DeckGL
        ref={deckRef}
        views={new MapView({ farZMultiplier: 50 })}
        controller={{
          scrollZoom: { speed: 0.005, smooth: false },
          inertia: true,
        }}
        layers={[...layers, terrainlayer]}
        initialViewState={initialViewState}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          backgroundColor: "var(--mui-palette-background-default)",
        }}
        useDevicePixels={false}
        // onLoad={onMapLoad}
      >
        {/* {IsLoading && <LinearProgress variant="query" />} */}
        {hoverInfo && <MapToolTip pickingInfo={hoverInfo} />}
        {mapToolsVisible && (
          <>
            <Button onClick={flyToDataSource} sx={{ left: "36px" }}>
              reset view
            </Button>
          </>
        )}
      </DeckGL>
    </>
  );
}
