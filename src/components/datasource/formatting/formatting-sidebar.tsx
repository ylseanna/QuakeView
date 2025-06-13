import { Drawer, Toolbar, Typography } from "@mui/material";
import DataSourceFormattingElement from "./formatting-element";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { useProjectStore } from "@/providers/project-store-provider";

interface FormattingProps {
  setFormatting: CallableFunction;
  drawerOpen: boolean;
  single?: boolean;
}

export default function FormattingSidebar({
  setFormatting,
  drawerOpen,
}: FormattingProps) {
  const t = useTranslations("Formatting");

  const DRAWER_WIDTH = "360px";

  const sxtextbox = {
    fontSize: "12pt",
    p: 2,
  };

  const ref = useRef(null);

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
            top: "30px"
          },
        }}
      >
        <Toolbar />
        <Typography sx={sxtextbox}>
          <b>{t("formatting")}</b>
        </Typography>
        {!dataSources
          ? null
          : dataSources.allIDs .map((id) => (
              <DataSourceFormattingElement
                key={id}
                dataSource={dataSources.byID[id]}
                setFormatting={setFormatting}
                single={(dataSources.allIDs.length > 1 ? false : true)}
              />
            ))}
      </Drawer>
    </>
  );
}
