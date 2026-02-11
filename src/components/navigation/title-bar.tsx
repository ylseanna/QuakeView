"use client";

import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  Stack,
  Theme,
  Box,
  useTheme,
  Divider,
  ListItemText,
  Typography,
} from "@mui/material";
import Toolbar from "@mui/material/Toolbar";

import { useTranslations } from "next-intl";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { Fragment } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import ViewMenu from "./title-menus/view-menu";

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

  const t = useTranslations();

  return (
    <Toolbar
      className="draggableArea"
      sx={{
        minHeight: "32px!important",
        borderBottom: `1px solid ${theme.palette.divider}`,
        paddingLeft: "4px",
        paddingRight: "100px",
        justifyContent: "space-between",
        zIndex: theme.zIndex.appBar,
        backgroundColor: theme.palette.background.paper,
      }}
      disableGutters
    >
      <Stack direction="row" margin="4px" spacing={0}>
        <Box sx={{ paddingRight: "8px" }}>
          <Image src="/icon.png" alt="app icon" width={22} height={22} />
        </Box>

        <PopupState variant="popover" popupId="file-popup-menu">
          {(popupState) => (
            <Fragment>
              <Button
                className="noDragArea"
                sx={{ color: theme.palette.text.primary, ...SxTopNavButton }}
                {...bindTrigger(popupState)}
              >
                {t("Common.file")}
              </Button>
              <Menu
                {...bindMenu(popupState)}
                slotProps={{
                  paper: {
                    variant: "outlined",
                  },
                }}
              >
                <MenuList dense disablePadding>
                  <MenuItem onClick={popupState.close} disabled>
                    New session
                  </MenuItem>
                  <MenuItem onClick={popupState.close} disabled>
                    Load session
                  </MenuItem>
                </MenuList>
              </Menu>
            </Fragment>
          )}
        </PopupState>
        <ViewMenu />
        <PopupState variant="popover" popupId="help-popup-menu">
          {(popupState) => (
            <Fragment>
              <Button
                className="noDragArea"
                sx={{ color: theme.palette.text.primary, ...SxTopNavButton }}
                {...bindTrigger(popupState)}
              >
                {t("Common.help")}
              </Button>
              <Menu
                {...bindMenu(popupState)}
                slotProps={{
                  paper: {
                    variant: "outlined",
                    sx: { width: 280, maxWidth: "100%" },
                  },
                }}
              >
                <MenuList dense disablePadding>
                  <MenuItem onClick={popupState.close}>
                    <Link href={"tutorial"}>Tutorial page</Link>
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    sx={{
                      pt: 0,
                      pb: 0,
                      cursor: "initial",
                      ":hover": { background: "None" },
                    }}
                    disableRipple
                  >
                    <ListItemText>{t("Titlebar.debug_window")}</ListItemText>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      F3
                    </Typography>
                  </MenuItem>
                </MenuList>
              </Menu>
            </Fragment>
          )}
        </PopupState>
      </Stack>
      {/* <Stack direction="row" className="noDragArea" sx={{ justifySelf: "end" }}>
        <LanguageSwitcher />
      </Stack> */}
    </Toolbar>
  );
}
