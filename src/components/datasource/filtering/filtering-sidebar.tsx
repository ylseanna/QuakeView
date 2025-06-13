import { Drawer, Toolbar, Typography } from "@mui/material";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import FilteringElement from "./filtering-element";
import { useProjectStore } from "@/providers/project-store-provider";

interface FormattingProps {
  setFiltering: CallableFunction;
  drawerOpen: boolean;
}

export default function FilteringSidebar({
  setFiltering,
  drawerOpen,
}: FormattingProps) {
  const t = useTranslations("Filtering");

  const dataSources = useProjectStore((state) => state.dataSources);

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
            top: "30px"
          },
          
        }}
      >
        <Toolbar />
        <Typography sx={sxtextbox}>
          <b>{t("filtering")}</b>
        </Typography>
        {!dataSources
          ? null
          : dataSources.allIDs.map((id) => (
              <FilteringElement
                key={id}
                dataSource={dataSources.byID[id]}
                setFiltering={setFiltering}
                single={dataSources.allIDs.length > 1 ? false : true}
              />
            ))}
      </Drawer>
    </>
  );
}
