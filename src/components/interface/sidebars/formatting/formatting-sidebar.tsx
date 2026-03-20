import { Typography } from "@mui/material";
import { useTranslations } from "next-intl";

import { useProjectStore } from "@/providers/project-store-provider";
import SideDrawer from "@/components/custom/side-drawer";
import { useCatalogData } from "../../../data/use-data";
import DataSourceFormattingElement from "./formatting-element";

export default function FormattingSidebar() {
  const t = useTranslations("Formatting");

  const sxtextbox = {
    fontSize: "12pt",
    p: 2,
  };

  const { data } = useCatalogData();
  const dataSources = useProjectStore((state) => state.dataSources);

  return (
    <SideDrawer type="formatting">
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
    </SideDrawer>
  );
}
