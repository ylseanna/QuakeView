"use client";

import {
  Autocomplete,
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Folder } from "mdi-material-ui";
import { getInitDataSource } from "./add-datasource";
import { useProjectStore } from "@/providers/project-store-provider";

export default function DataSelector() {
  const t = useTranslations("Sources");

  const addDataSource = useProjectStore(
    (state) => state.dataSourceActions.addDataSource,
  );

  const setTimeFilteringGPU = useProjectStore(
    (state) => state.GPUfilteringActions.setTimeFiltering,
  );

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column" }}>
      {/* {isLoading && <LinearProgress />} */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h6">
          {t("data_sources")}
        </Typography>

        <Button
          variant="contained"
          disableElevation
          onClick={async () => {
            const filePath = await window.electronAPI.openFile();

            const initDataSource = await getInitDataSource(filePath);

            initDataSource.interface.loadable =
              initDataSource.metadata.variables.required_vars // for every required variable
                .filter((variable) => variable != "t") // exclude t
                .map((variable) => {
                  // get all mapped vars
                  return initDataSource.metadata.variables.by_id[
                    variable
                  ].mapped_var
                    .map(
                      // check if the mapped vars are contained in the catalog headers
                      (mapped_var) =>
                        initDataSource.metadata.column_names.includes(
                          mapped_var,
                        ),
                    )
                    .some((variableContainsCheck) => variableContainsCheck); // return true if at least one of the mapped variables is in the catalog headers
                })
                .every((mappedVarConsistent) => mappedVarConsistent); // return true if all required variables have a mapped variable, else disable loading until changed by user

            console.log(initDataSource);

            addDataSource(initDataSource);
            setTimeFilteringGPU([0, 2147483647 * 1000]);
          }}
          sx={{ height: "100%"}}
        >
          <Folder sx={{ mr: 2 }} />
          Choose file
        </Button>
      </Stack>
    </Box>
  );
}
