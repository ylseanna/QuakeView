"use client";

import {
  Extent,
  // EXTENT_JSON_CODEC,
} from "@/components/datasource/types";
import { useKeyDown } from "@react-hooks-library/core";
import "maplibre-gl/dist/maplibre-gl.css";

// import * as _ from "lodash";

import { useState } from "react";
import Actions from "../../../../components/datasource/actions";
import ThreeDDeckGLView from "../../../../components/map/3D-deckgl";
import { useProjectStore } from "@/providers/project-store-provider";
// import { useDataStore } from "@/providers/data-store-provider";
// import { fetchData } from "@/components/datasource/load-data";
// import { LinearProgress } from "@mui/material";

export default function Page() {
  const { dataSources } = useProjectStore((state) => state);

  // // load data (synchronized accros app)
  // const { data, addData } = useDataStore((state) => state);
  // const [dataLoading, setDataLoading] = useState(false);

  // useEffect(() => {
  //   dataSources.allIDs.forEach(async (id: string) => {
  //     if (!Object.keys(data).includes(id)) {
  //       setDataLoading(true);

  //       const fetched_data = await fetchData(dataSources.byID[id]);
  //       console.log(fetched_data);

  //       addData(id, fetched_data, dataSources.byID[id].interface.addedVars);

  //       setDataLoading(false);
  //     } else if (
  //       !_.isEmpty(
  //         _.xor(data[id].addedVars, dataSources.byID[id].interface.addedVars)
  //       )
  //     ) {
  //       console.log();

  //       let fetched_data = [];

  //       fetched_data = await fetchData(dataSources.byID[id]);

  //       setDataLoading(true);

  //       console.log(fetched_data);

  //       addData(id, fetched_data, dataSources.byID[id].interface.addedVars);

  //       setDataLoading(false);
  //     }
  //   });
  // }, [data, addData, dataSources, dataLoading]);

  const calculateExtent = () => {
    let extent: Extent | null = null;
    if (dataSources != null) {
      dataSources.allIDs.map((id) => {
        extent = dataSources.byID[id].metadata.extent;
      });
    }
    return extent;
  };

  // CHANGE HEIGHT

  const [positionOffset, setPositionOffset] = useState<number>(0);

  useKeyDown(["PageDown"], (e) => {
    setPositionOffset((positionOffset) => positionOffset - 0.1);
    console.log(positionOffset);
    e.preventDefault();
  });

  useKeyDown(["PageUp"], (e) => {
    setPositionOffset((positionOffset) => positionOffset + 0.1);
    console.log(positionOffset);
    e.preventDefault();
  });

  return (
    <>
      {/* {dataLoading && <LinearProgress />} */}
      <Actions />
      <>
        <ThreeDDeckGLView
          extent={calculateExtent()}
          positionOffset={positionOffset}
        />
      </>
    </>
  );
}
