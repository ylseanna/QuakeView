import { Typography } from "@mui/material";
import { useTranslations } from "next-intl";

import { useProjectStore } from "@/providers/project-store-provider";
import SideDrawer from "@/components/custom/side-drawer";
import FilteringElement from "./filtering-element";

export default function FilteringSidebar() {
  const t = useTranslations("Filtering");

  const dataSources = useProjectStore((state) => state.dataSources);

  const sxtextbox = {
    fontSize: "12pt",
    p: 2,
  };

  return (
    <>
      <SideDrawer type="filtering">
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
      </SideDrawer>
    </>
  );
}
