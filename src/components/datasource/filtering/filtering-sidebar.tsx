import { Drawer, Toolbar, Typography } from "@mui/material";
import { DataSource } from "../types";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import FilteringElement from "./filtering-element";

interface FormattingProps {
  dataSources: DataSource[];
  // setDataSources: Dispatch<SetStateAction<DataSource[] | null>>;
  setFiltering: CallableFunction;
  drawerOpen: boolean;
}

export default function FilteringSidebar({
  dataSources,
  // setDataSources,
  setFiltering,
  drawerOpen,
}: FormattingProps) {
  const t = useTranslations("Filtering");

  const DRAWER_WIDTH = "360px";

  const sxtextbox = {
    fontSize: "12pt",
    p: 2,
  };

  const ref = useRef(null);

  return (
    <>
      <Drawer
        ref={ref}
        anchor="right"
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Typography sx={sxtextbox}>
          <b>{t("filtering")}</b>
        </Typography>
        {!dataSources
          ? null
          : (dataSources as DataSource[]).map((dataSource) => (
              <FilteringElement
                key={dataSource.internal_id}
                dataSource={dataSource}
                setFiltering={setFiltering}
                single={dataSources.length > 1 ? false : true}
              />
            ))}
      </Drawer>
    </>
  );
}
