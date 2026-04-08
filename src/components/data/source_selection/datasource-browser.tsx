"use client";

import Tabs from "@mui/material/Tabs";
import DataSelector from "./datasource-selector";
import DataTab from "./datasource-tab";
import { useProjectStore } from "@/providers/project-store-provider";
import Tab from "@mui/material/Tab";
import { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { ScrollBarStyling } from "@/components/custom/scrollbar-styling";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ScatterPlot, Warning } from "@mui/icons-material";

export default function DataSourceBrowser() {
  const theme = useTheme();

  // state

  const { dataSources } = useProjectStore((state) => state);

  const removeDataSource = useProjectStore(
    (state) => state.dataSourceActions.removeDataSource,
  );

  // control tabs

  const TAB_WIDTH = 500;

  const [value, setValue] = useState(
    dataSources.allIDs ? dataSources.allIDs[0] : null,
  );

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Stack display="flex" flexDirection="row" height="100%" width="100%" sx={{backgroundColor: theme.palette.background.default}}>
      <Stack
        width={`${TAB_WIDTH}px`}
        height={"100%"}
        display="flex"
        flexDirection="column"
        sx={{ borderRight: `1px solid ${theme.palette.divider}` }}
      >
        <DataSelector />
        <Divider />
        <Tabs
          orientation="vertical"
          value={value}
          onChange={handleChange}
          variant="fullWidth"
        >
          {!dataSources.allIDs
            ? null
            : dataSources.allIDs.map((dataSourceID) => (
                <Tab
                  sx={{ width: `${TAB_WIDTH}px` }}
                  key={"DataTab-" + dataSourceID}
                  value={dataSourceID}
                  label={
                    <Box
                      sx={{
                        display: "flex",
                        width: "100%",
                        color: !(dataSourceID == value)
                          ? theme.palette.text.primary
                          : "inherit",
                      }}
                    >
                      {dataSources.byID[dataSourceID].interface.loadable ? (
                        <ScatterPlot sx={{ opacity: 0.6, mr: 1 }} />
                      ) : (
                        <Warning
                          sx={{ mr: 1, color: theme.palette.warning.main }}
                        />
                      )}
                      <Typography
                        sx={{
                          ...(dataSources.byID[dataSourceID].interface.loadable
                            ? {}
                            : { color: theme.palette.warning.main }),
                          textTransform: "none",
                        }}
                      >
                        {dataSources.byID[dataSourceID].name}
                      </Typography>
                    </Box>
                  }
                />
              ))}
        </Tabs>
      </Stack>

      <Box
        sx={{
          height: "100%",
          minWidth: `calc(100vw - ${TAB_WIDTH}px)`,
          ...ScrollBarStyling,
        }}
      >
        {value ? <DataTab id={value} /> : null}
      </Box>
    </Stack>
  );
}
