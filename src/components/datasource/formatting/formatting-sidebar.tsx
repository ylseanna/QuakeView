import { Drawer, Toolbar, Typography } from "@mui/material";
import { DataSource, DataSourceFormatting } from "../types";
import DataSourceFormattingElement from "./formatting-element";
import { Dispatch, SetStateAction, useRef } from "react";
import { useTranslations } from "next-intl";

interface FormattingProps {
  dataSources: DataSource[];
  setDataSources: Dispatch<SetStateAction<DataSource[] | null>>;
  drawerOpen: boolean;
  single?: boolean;
}

export default function FormattingSidebar({
  dataSources,
  setDataSources,
  drawerOpen,
}: FormattingProps) {
  const t = useTranslations("Formatting");

  const DRAWER_WIDTH = "360px";

  const sxtextbox = {
    fontSize: "12pt",
    p: 2,
  };

  const ref = useRef(null);

  const setFormatting = (
    id: string,
    keyToModify: keyof DataSourceFormatting,
    value: never
  ) => {
    const indexToModify = dataSources?.findIndex(
      (dataSource) => dataSource.internal_id === id
    );

    const modifiedDataSource = dataSources[indexToModify];

    modifiedDataSource.formatting[keyToModify] = value;

    dataSources[indexToModify] = modifiedDataSource;

    setDataSources(dataSources);
  };

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
          <b>{t("formatting")}</b>
        </Typography>
        {!dataSources
          ? null
          : (dataSources as DataSource[]).map((dataSource) => (
              <DataSourceFormattingElement
                key={dataSource.internal_id}
                dataSource={dataSource}
                setFormatting={setFormatting}
                single={(dataSources.length > 1 ? false : true)}
              />
            ))}
      </Drawer>
    </>
  );
}
