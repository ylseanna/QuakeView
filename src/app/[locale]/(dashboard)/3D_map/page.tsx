"use client";

import { useLocalStorageState } from "@toolpad/core";
import {
  DataSource,
  DATASOURCE_JSON_CODEC,
  Extent,
  // EXTENT_JSON_CODEC,
} from "@/components/datasource/types";
import { useKeyDown } from "@react-hooks-library/core";
import "maplibre-gl/dist/maplibre-gl.css";

import { useState } from "react";
import Actions from "../../../../components/datasource/actions";
import ThreeDDeckGLView from "../../../../components/map/3D-deckgl";

export default function Page() {
  const [dataSources, setDataSources] = useLocalStorageState<DataSource[]>(
    "data-sources",
    [],
    {
      codec: DATASOURCE_JSON_CODEC,
    }
  );

  const calculateExtent = () => {
    let extent: Extent | null = null;
    if (dataSources != null) {
      dataSources.forEach((dataSource) => {
        extent = dataSource.metadata.extent;
      });
    }
    return extent;
  };

  // CHANGE HEIGHT

  const [positionOffset, setPositionOffset] = useState<number>(0);

  useKeyDown(["PageDown"], (e) => {
    setPositionOffset((positionOffset) => positionOffset + 0.1);
    console.log(positionOffset);
    e.preventDefault();
  });

  useKeyDown(["PageUp"], (e) => {
    setPositionOffset((positionOffset) => positionOffset - 0.1);
    console.log(positionOffset);
    e.preventDefault();
  });


  return (
    <>
      {/* <FormattingSidebar
        dataSources={dataSources as DataSource[]}
        setDataSources={setDataSources}
      /> */}
      <Actions
        dataSources={dataSources!}
        setDataSources={setDataSources}

      />
      <>
        <ThreeDDeckGLView
          dataSources={dataSources}
          extent={calculateExtent()}
          positionOffset={positionOffset}
        />

      </>
    </>
  );
}
