"use client";

import { Stack, Theme, Box, useTheme } from "@mui/material";
import Toolbar from "@mui/material/Toolbar";

import { useTranslations } from "next-intl";
import Image from "next/image";
import ViewMenu from "./title-menus/view-menu";
import { usePlatform } from "@/components/custom/use-platform";
import HelpMenu from "./title-menus/help-menu";

export const SxTopNavButton = {
  opacity: 0.87,
  height: "22px",
  padding: "8px",
  minWidth: "0px",
  textTransform: "capitalize",
  alignItems: "center",
  fontSize: "0.850rem",
  lineHeight: "1",
  fontWeight: "500",
};

export default function TitleBar() {
  const theme = useTheme() as Theme;

  const platform = usePlatform();
  console.log(platform);
  return (
    <Toolbar
      className="draggableArea"
      sx={{
        minHeight: "32px!important",
        borderBottom: `1px solid ${theme.palette.divider}`,
        paddingLeft: platform != "darwin" ? "4px" : "75px",
        paddingRight: platform != "darwin" ? "75px" : "4px",
        justifyContent: "space-between",
        zIndex: theme.zIndex.appBar,
        backgroundColor: theme.palette.background.paper,
      }}
      disableGutters
    >
      <Stack
        direction={platform != "darwin" ? "row" : "row-reverse"}
        justifyContent={platform != "darwin" ? "start" : "space-between"}
        margin="4px"
        width="100%"
        spacing={0}
      >
        <Box
          sx={{
            pr: platform != "darwin" ? "8px" : 0,
            pl: platform != "darwin" ? 0 : "8px",
          }}
        >
          <Image src="/icon.png" alt="app icon" width={22} height={22} />
        </Box>
        <Box>
          <ViewMenu />
          <HelpMenu />
        </Box>
      </Stack>
    </Toolbar>
  );
}
