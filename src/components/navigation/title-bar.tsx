/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  Stack,
  Theme,
  Box,
  useTheme
} from "@mui/material";
import Toolbar from "@mui/material/Toolbar";

import { useTranslations } from "next-intl";
import { MouseEvent, useState } from "react";
import LanguageSwitcher from "./language-switcher";
import ThemeSwitcher from "./theme-switcher";

export const SxTopNavButton = {
  height: "22px",
  padding: "8px",
  minWidth: "0px",
  textTransform: "capitalize",
  alignItems: "center",
  fontSize: "0.830rem",
  lineHeight: "1",
  fontWeight: "500",
};

export default function TitleBar() {
  const theme = useTheme() as Theme;

  const t = useTranslations();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Toolbar
      className="draggableArea"
      sx={{
        minHeight: "32px!important",
        borderBottom: `1px solid ${theme.palette.divider}`,
        paddingLeft: "4px",
        paddingRight: "100px",
        justifyContent: "space-between",
        zIndex: theme.zIndex.drawer + 200,
        backgroundColor: theme.palette.background.paper,
      }}
      disableGutters
    >
      <Stack direction="row" margin="4px" spacing={0}>
        <Box sx={{ paddingRight: "8px" }}>
          <img
            loading="lazy"
            width="22px"
            height="22px"
            srcSet={`icon.png 2x`}
            src={`icon.png`}
            alt=""
          />
        </Box>

        <Button
          id="basic-button"
          aria-controls={open ? "file-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          className={open ? "noDragArea Mui-focusVisible" : "noDragArea"}
          sx={SxTopNavButton}
        >
          {t("Common.file")}
        </Button>
        <Menu
          id="file-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          slotProps={{
            list: {
              "aria-labelledby": "basic-button",
            },
            paper: {
              variant: "outlined",
            },
          }}
          transitionDuration={0}
        >
          <MenuList dense disablePadding>
            <MenuItem onClick={handleClose}>New Session</MenuItem>
            <MenuItem onClick={handleClose}>Open Session</MenuItem>
          </MenuList>
        </Menu>
        <Button className="noDragArea" sx={SxTopNavButton}>
          View
        </Button>
      </Stack>
      <Stack direction="row" className="noDragArea" sx={{ justifySelf: "end" }}>
        <ThemeSwitcher />
        <LanguageSwitcher />
      </Stack>
    </Toolbar>
  );
}
