"use client";

import {
  Autocomplete,
  Button,
  ButtonGroup,
  Divider,
  Grid,
  // LinearProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Folder } from "mdi-material-ui";
import { getInitDataSource } from "./add-datasource";
import { useProjectStore } from "@/providers/project-store-provider";

export default function DataSelector() {
  const t = useTranslations("Sources");

  // const [DataOptions, setOption] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);

  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(
    null,
  );

  const addDataSource = useProjectStore(
    (state) => state.dataSourceActions.addDataSource,
  );

  const setTimeFilteringGPU = useProjectStore(
    (state) => state.GPUfilteringActions.setTimeFiltering,
  );

  return (
    <Paper sx={{ mb: 3, display: "flex", flexDirection: "column" }}>
      {/* {isLoading && <LinearProgress />} */}

      <Typography sx={{ m: 2 }} variant="h6">
        {t("data_sources")}
      </Typography>
      <Divider></Divider>

      <Grid container sx={{ m: 2 }}>
        <Grid>
          {/* <MuiFileInput
            size="small"
            onChange={(newValue) => {
              console.log(newValue);
            }}
            InputProps={{
              inputProps: {
                accept: ".csv",
              },
              startAdornment: (
                <>
                  <Folder sx={{ mr: 2 }} /> Insert a file
                </>
              ),
            }}
          /> */}
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
                          initDataSource.metadata.catalog_headers.includes(
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
            sx={{ height: "100%" }}
          >
            <Folder sx={{ mr: 2 }} />
            Choose file
          </Button>
        </Grid>
        <Divider flexItem orientation="vertical" sx={{ mr: 2, ml: 2 }} />
        <Grid size="grow">
          <ButtonGroup
            sx={{ width: "calc(100%)" }}
            size="small"
            variant="contained"
            disableElevation
          >
            <Autocomplete
              sx={{
                width: "calc(100%)",
                "& fieldset": {
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }}
              value={selectedDataSource}
              onChange={(event, newValue) => setSelectedDataSource(newValue)}
              size="small"
              options={[]}
              renderInput={(params) => (
                <TextField {...params} label="Recent files" />
              )}
            />
          </ButtonGroup>
        </Grid>
      </Grid>
    </Paper>
  );
}
