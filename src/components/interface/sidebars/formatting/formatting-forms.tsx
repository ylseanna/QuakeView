"use client";

import { Box } from "@mui/material";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { DataSource } from "@/components/custom/types";
import { useTranslations } from "next-intl";

import { useState } from "react";
import DataSourceFormattingForm from "./formatting-form";

export default function DataSourceFormattingForms({
  dataSource,
}: {
  dataSource: DataSource;
}) {
  const t = useTranslations("Formatting");

  const [value, setValue] = useState("1");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab
              label={t("Formatting.map")}
              value="1"
              sx={{ width: "calc(100% / 3)" }}
            />
            <Tab
              label={t("Formatting.3D_map")}
              value="2"
              sx={{ width: "calc(100% / 3)" }}
            />
            <Tab
              label={t("Formatting.plot")}
              value="3"
              sx={{ width: "calc(100% / 3)" }}
            />
          </TabList>
        </Box>
        <TabPanel value="1" sx={{ p: 2 }}>
          <DataSourceFormattingForm dataSource={dataSource} type="twoD" />
        </TabPanel>
        <TabPanel value="2" sx={{ p: 2 }}>
          <DataSourceFormattingForm dataSource={dataSource} type="threeD"/>
        </TabPanel>
        <TabPanel value="3" sx={{ p: 2 }}>
          <DataSourceFormattingForm dataSource={dataSource} type="plot" />
        </TabPanel>
      </TabContext>
    </>
  );
}
