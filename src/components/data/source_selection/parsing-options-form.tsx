/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Grid,
  Chip,
  Divider,
  styled
} from "@mui/material";

// import {
//   DataSource,
//   DataSourceDataDescription,
//   DataSourceFormatting,
// } from "@/components/datasource/types";
import { useTranslations } from "next-intl";
// import { Dispatch, SetStateAction, useCallback } from "react";

import { SubAccordionDetails } from "../../custom/accordion";
import { useProjectStore } from "@/providers/project-store-provider";
// import { useEffect } from "react";
import DataSourceVariableForm from "../variables/variable-form";
import { DataSource } from "../../custom/types";
import { updatedMetaDataUrl } from "../data-source-query";
import { useEffect } from "react";
import { PathParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { headerFilteringStateInitializer } from "@mui/x-data-grid/internals";

interface DataTabProps {
  dataSource: DataSource;
}

const sxButton = {
  padding: "4px 8px 4px 8px",
  textTransform: "capitalize",
  lineHeight: 1,
  h: 3,
};

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

function GeneralParsingOptionsForm({ dataSource }: { dataSource: DataSource }) {
  const t = useTranslations();

  const { setSep } = useProjectStore((state) => state.metadataActions);

  return (
    <Box sx={{ px: 2 }}>
      <Typography sx={{ fontWeight: "bold", mt: 1 }}>
        {t("Variables.general_options")}
      </Typography>
      <Grid
        container
        spacing={2}
        sx={{ alignItems: "center", minHeight: "40px" }}
      >
        <Grid size={2.5}>
          <Typography variant="formlabel">{t("Sources.delimiter")}</Typography>
        </Grid>
        <Grid
          size="grow"
          display="flex"
          justifyContent="end"
          alignItems="center"
        >
          <ToggleButtonGroup
            color="primary"
            value={dataSource.metadata.sep}
            exclusive
            onChange={(event) => {
              setSep(
                dataSource.internal_id,
                (event.target as HTMLInputElement).value,
              );
            }}
            aria-label="mode"
            sx={{ height: "24px" }}
          >
            <ToggleButton value="\s+" sx={sxButton}>
              {t("Sources.whitespace")}
            </ToggleButton>
            <ToggleButton value="," sx={sxButton}>
              {t("Sources.comma")}
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>
    </Box>
  );
}

function HeaderForm({ dataSource }: { dataSource: DataSource }) {
  const t = useTranslations();


  return (
    <Box sx={{ px: 2 }}>
      <Typography sx={{ fontWeight: "bold", mt: 1 }}>
        {t("Variables.catalog_header")}
      </Typography>
      <Paper
        variant="outlined"
        sx={{ p: 2, my: 2, flexWrap: "wrap", listStyle: "none", display: 'flex',
        justifyContent: 'left', }}
        component="ul"
      >
        {dataSource.metadata.catalog_headers.map((header_name) => (
           <ListItem key={"HeaderChip" + header_name}>
          <Chip variant="outlined" label={header_name} /></ListItem>
        ))}
      </Paper>
    </Box>
  );
}

export const fetchUpdatedMetadata = async (dataSource: DataSource) => {
  return await fetch(updatedMetaDataUrl(dataSource)).then((res) => res.json());
};

export default function ParsingForm({ dataSource }: DataTabProps) {
  const t = useTranslations();

  const { setIndex, setSep, setDatetimeFormat } = useProjectStore(
    (state) => state.metadataActions,
  );


  const setMetadata = useProjectStore(
    (state) => state.dataSourceActions.setMetadata,
  );

  const updateMetadata = async (dataSource: DataSource) => {
    // update bounds and metadata after setting mapped variables

    // fetch updated metadata
    const updatedMetadata = await fetchUpdatedMetadata(dataSource);

    // set metadata
    setMetadata(dataSource.internal_id, updatedMetadata);
  };

  useEffect(() => {
    updateMetadata(dataSource);
  }, [dataSource.metadata.sep]);

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden", mb: 2 }}>
      <Box display="flex" sx={{ m: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>
          {t("Sources.parsing_options")}
        </Typography>
      </Box>

      <SubAccordionDetails>
        <GeneralParsingOptionsForm dataSource={dataSource} />
        <Divider sx={{ mx: 2, mt: 1, mb: 2 }} />
        <HeaderForm dataSource={dataSource} />
        <Divider sx={{ mx: 2, mt: 1 }} />
        <DataSourceVariableForm dataSource={dataSource} />
      </SubAccordionDetails>
    </Paper>
  );
}
