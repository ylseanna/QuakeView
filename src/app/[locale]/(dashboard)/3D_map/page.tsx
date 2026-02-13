"use client";

import {
  Extent,
  // EXTENT_JSON_CODEC,
} from "@/components/datasource/types";
import { useKeyDown } from "@react-hooks-library/core";
import "maplibre-gl/dist/maplibre-gl.css";

import { useState } from "react";
import Actions from "../../../../components/datasource/actions";
import ThreeDDeckGLView from "../../../../components/map/3D-deckgl";
import { useProjectStore } from "@/providers/project-store-provider";
import { useData } from "@/components/datasource/use-data";

export default function Page() {
  const { dataSources } = useProjectStore((state) => state);
  const { data } = useData();

  const calculateExtent = () => {
    let extent: Extent | null = null;
    if (dataSources != null) {
      data.allIDs.map((id) => {
        extent = data.byID[id].extent;
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
      <Actions />
        <ThreeDDeckGLView
          extent={calculateExtent()}
          positionOffset={positionOffset}
        ></ThreeDDeckGLView>
    </>
  );
}
