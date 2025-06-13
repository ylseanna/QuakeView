"use client";

import {
  Autocomplete,
  Button,
  ButtonGroup,
  Divider,
  Grid2,
  // LinearProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Folder } from "mdi-material-ui";
import { getInitDataSource } from "../add-datasource";
import { useProjectStore } from "@/providers/project-store-provider";

export default function DataSelector() {
  const t = useTranslations("Sources");

  // const [DataOptions, setOption] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);

  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(
    null
  );

  const addDataSource = useProjectStore(
    (state) => state.dataSourceActions.addDataSource
  );


  return (
    <Paper sx={{ mb: 3 }}>
      {/* {isLoading && <LinearProgress />} */}

      <Typography sx={{ m: 2 }} variant="h6">
        {t("data_sources")}
      </Typography>
      <Divider></Divider>

      <Grid2 container sx={{ m: 2 }}>
        <Grid2>
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
              console.log(initDataSource);
              addDataSource(initDataSource)
            }}
            sx={{ height: "100%" }}
          >
            <Folder sx={{ mr: 2 }} />
            Choose file
          </Button>
        </Grid2>
        <Divider flexItem orientation="vertical" sx={{ mr: 2, ml: 2 }} />
        <Grid2 size="grow">
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
        </Grid2>
      </Grid2>
    </Paper>
  );
}
