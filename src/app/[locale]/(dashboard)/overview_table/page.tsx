"use client";

import { Paper, LinearProgress } from "@mui/material";
import { PageContainer, PageHeader } from "@toolpad/core";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { isIS, enUS } from "@mui/x-data-grid/locales";
import { useLocale, useTranslations } from "next-intl";

const paginationModel = { page: 0, pageSize: 10 };

export default function Page() {
  // locale and translations
  const t = useTranslations("Table");
  const locale = useLocale();

  if (locale == "is") {
    // eslint-disable-next-line no-var
    var locale_text = isIS.components.MuiDataGrid.defaultProps.localeText;
  } else {
    // eslint-disable-next-line no-var
    var locale_text = enUS.components.MuiDataGrid.defaultProps.localeText;
  }

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "Event ID",
      type: "string",
      minWidth: 150,
      flex: 1,
    },
    {
      field: "DT",
      headerName: t("time"),
      type: "string",
      minWidth: 150,
      flex: 1,
      valueFormatter: (value : string) => value.replace(" ", "T"),
      width: 90,
    },
    {
      field: "X",
      headerName: t("lon"),
      type: "number",
      minWidth: 150,
      flex: 1,
    },
    {
      field: "Y",
      headerName: t.raw("lat"),
      type: "number",
      minWidth: 150,
      flex: 1,
    },
    {
      field: "Z",
      headerName: t("dep"),
      type: "number",
      minWidth: 150,
      flex: 1,
    },
    {
      field: "ML",
      renderHeader: () => (
        <span>
          {"M"}
          <sub>{"L"}</sub>
        </span>
      ),
      type: "number",
      minWidth: 150,
      flex: 1,
    },
  ];

  const [eventJSON, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_APP_BASE_PATH}/api/testdata`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <LinearProgress />;
  if (!eventJSON) return <p>No data</p>;

  return (
    <Paper sx={{ m: 2, height:"calc(100% - 32px)"
    }}>
      <DataGrid
        localeText={locale_text}
        rows={eventJSON}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[10, 50, 100]}
        sx={{ border: 0 }}
        slots={{ toolbar: GridToolbar }}
        autoPageSize
      />
    </Paper>
  );
}
