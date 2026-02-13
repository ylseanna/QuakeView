import { Drawer, Typography } from "@mui/material";
import { useTheme } from "@mui/material";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import { ScrollBarStyling } from "@/components/layout/scrollbar-styling";
import { useProjectStore } from "@/providers/project-store-provider";
import DataSourceFormattingElement from "./formatting-element";
import { useData } from "../use-data";

interface FormattingProps {
  drawerOpen: boolean;
  single?: boolean;
}

export default function FormattingSidebar({
  drawerOpen,
}: FormattingProps) {
  const t = useTranslations("Formatting");
  const theme = useTheme();

  const DRAWER_WIDTH = "360px";

  const sxtextbox = {
    fontSize: "12pt",
    p: 2,
  };

  const ref = useRef(null);

  const { data } = useData()
  const dataSources = useProjectStore((state) => state.dataSources);

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
            overflowX: "hidden",
            ...ScrollBarStyling,
            top: "calc(80px + 32px)",
          },
        }}
      >
        {/* <Box sx={{ display: "box", height: "calc(80px + 32px)" }} /> */}
        <Typography sx={sxtextbox}>
          <b>{t("formatting")}</b>
        </Typography>
        {!dataSources
          ? null
          : data.allIDs.map((id) => (
              <DataSourceFormattingElement
                key={id}
                dataSource={dataSources.byID[id]}
                single={dataSources.allIDs.length > 1 ? false : true}
              />
            ))}
      </Drawer>
    </>
  );
}
