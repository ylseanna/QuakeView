import { Drawer, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/material";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import { useProjectStore } from "@/providers/project-store-provider";
import FilteringElement from "./filtering-element";

interface FormattingProps {
  drawerOpen: boolean;
}

export default function FilteringSidebar({
  drawerOpen,
}: FormattingProps) {
  const theme = useTheme();
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
            zIndex: theme.zIndex.appBar - 100,
          },
        }}
      >
        <Box sx={{display: "box", height: "calc(80px + 32px)"}} />
        <Typography sx={sxtextbox}>
          <b>{t("filtering")}</b>
        </Typography>
        {!dataSources
          ? null
          : dataSources.allIDs.map((id) => (
              <FilteringElement
                key={id}
                dataSource={dataSources.byID[id]}
                single={dataSources.allIDs.length > 1 ? false : true}
              />
            ))}
      </Drawer>
    </>
  );
}
