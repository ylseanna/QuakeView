"use client";

import { CloudUpload } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  ButtonGroup,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useLocalStorageState } from "@toolpad/core";
import type { Codec } from "@toolpad/core";
import {
  DataSource,
  DataSourceDataDescription,
  DataSourceFormatting,
  DataSourceMetaData,
} from "@/components/datasource/types";

const JSON_CODEC: Codec<DataSource[]> = {
  parse: (raw: string) => JSON.parse(raw),
  stringify: (value: object) => JSON.stringify(value),
};

export default function DataSelector() {
  const t = useTranslations("Sources");

  const [DataOptions, setOption] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(
    null
  );

  const [dataSources, setDataSources] = useLocalStorageState<DataSource[]>(
    "data-sources",
    [],
    { codec: JSON_CODEC }
  );

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_APP_BASE_PATH}/api/map_data?mode=get_availability`
    )
      .then((res) => res.json())
      .then((data) => {
        setOption(data);
      });
  }, []);

  const addDataSource = () => {
    setIsLoading(true);

    fetch(
      `http://${process.env.NEXT_PUBLIC_HOST}${process.env.NEXT_PUBLIC_APP_BASE_PATH}/api/map_data?mode=metadata_query&filename=${selectedDataSource}`
    )
      .then((res) => res.json())
      .then((metadata: DataSourceMetaData) => {
        const internal_id = crypto.randomUUID();

        console.log({ internal_id: internal_id, filename: selectedDataSource });

        console.log(dataSources);

        const colormapsBounds = metadata.data_descr.map(
          (dataDescr: DataSourceDataDescription) => {
            const obj: { [variable: string]: [number, number] } = {};
            obj[dataDescr.variable] = dataDescr.bounds;
            return obj;
          }
        );

        console.log(colormapsBounds);

        console.log();

        setDataSources([
          ...(dataSources as DataSource[]),
          ...([
            {
              internal_id: internal_id,
              filename: selectedDataSource,
              name: selectedDataSource,
              interface: { pickable: false, visible: true, addedVars: [] },
              filtering: {
                mag: metadata.data_descr.find(
                  (dd: DataSourceDataDescription) => dd.variable == "mag"
                )?.bounds,
                t: metadata.data_descr.find(
                  (dd: DataSourceDataDescription) => dd.variable == "t"
                )?.bounds,
              },
              formatting: {
                scale: 15,
                opacity: 100,
                antialiasing: false,
                positionOffset: 0,
                color: {
                  mapping: "single",
                  single: "rgb(0, 0, 0)",
                  linear: {
                    variable: "mag",
                    cmap: "Batlow",
                    inverted: false,
                    domain: Object.assign({}, ...colormapsBounds),
                  },
                  categorical: {
                    variable: "",
                    cmap: "BatlowS",
                    inverted: false,
                  },
                },
              } as DataSourceFormatting,
              metadata: metadata,
            },
          ] as DataSource[]),
        ]);
      });

    setIsLoading(false);
  };

  return (
    <Paper sx={{ mb: 3 }}>
      {isLoading && <LinearProgress />}

      <Typography sx={{ m: 2 }} variant="h6">
        {t("data_sources")}
      </Typography>
      <Divider></Divider>
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
      >
        <Box sx={{ m: 2, width: "calc(100%)" }}>
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
              options={DataOptions}
              renderInput={(params) => <TextField {...params} label="CSV" />}
            />

            <Button sx={{ whiteSpace: "nowrap" }} onClick={addDataSource}>
              {t("add")}
            </Button>
          </ButtonGroup>
        </Box>
        <Box sx={{ m: 2 }}>
          <ButtonGroup
            sx={{ width: "calc(100%)", height: "100%" }}
            size="medium"
            variant="contained"
            disableElevation
          >
            <Button
              component="label"
              role={undefined}
              tabIndex={-1}
              disabled
              startIcon={<CloudUpload sx={{ ml: 2 }} />}
            >
              <span style={{ marginRight: "16px", whiteSpace: "nowrap" }}>
                {t("upload_files")}
              </span>
            </Button>
          </ButtonGroup>
        </Box>
      </Stack>
    </Paper>
  );
}
