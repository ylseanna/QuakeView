"use client";

import { Divider } from "@mui/material";

import { DataSource } from "@/components/datasource/types";

import ColorFormattingForm from "./sections/color-formatting-form";
import GeneralFormattingForm from "./sections/general-formatting-form";

export default function DataSourceFormattingForm({
  dataSource,
  type,
}: {
  dataSource: DataSource;
  type: "twoD" | "threeD" | "plot"
}) {
  return (
    <>
      <GeneralFormattingForm dataSource={dataSource} type={type}/>
      <Divider sx={{ mt: 2, mb: 2 }} />
      <ColorFormattingForm dataSource={dataSource} type={type} />
    </>
  );
}
