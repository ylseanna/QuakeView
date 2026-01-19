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
  ListItemIcon,
} from "@mui/material";
import Toolbar from "@mui/material/Toolbar";

import { useTranslations } from "next-intl";
import LanguageSwitcher from "./language-switcher";
import ThemeSwitcher from "./theme-switcher";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { Fragment } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Check } from "@mui/icons-material";

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
          {/* loading="lazy"
            width="22px"
            height="22px"
            srcSet={`icon.png 2x`}
            src={`icon.png`}
            alt=""
          /> */}
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
                  <MenuItem onClick={popupState.close}>New session</MenuItem>
                  <MenuItem onClick={popupState.close}>Load session</MenuItem>
                </MenuList>
              </Menu>
            </Fragment>
          )}
        </PopupState>
        <PopupState variant="popover" popupId="view-popup-menu">
          {(popupState) => (
            <Fragment>
              <Button
                className="noDragArea"
                sx={{ color: theme.palette.text.primary, ...SxTopNavButton }}
                {...bindTrigger(popupState)}
              >
                {t("Common.view")}
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
                  <MenuItem
                    sx={{ pt: 0, pb: 0, ":hover": { background: "None" } }}
                    disableRipple
                  >
                    <ListItemText>Language</ListItemText>
                    <LanguageSwitcher />
                  </MenuItem>
                  <MenuItem
                    sx={{ pt: 0, pb: 0, ":hover": { background: "None" } }}
                    disableRipple
                  >
                    <ListItemText>Theme</ListItemText>
                    <ThemeSwitcher />
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={popupState.close} disabled>
                    <ListItemIcon>
                      <Check />
                    </ListItemIcon>
                    <ListItemText>Show sidebar controls</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={popupState.close} disabled>
                    <ListItemIcon>
                      <Check />
                    </ListItemIcon>
                    <ListItemText>Show map tools</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={popupState.close} disabled>
                    <ListItemIcon>
                      <Check />
                    </ListItemIcon>
                    <ListItemText>Show animation controls</ListItemText>
                  </MenuItem>
                </MenuList>
              </Menu>
            </Fragment>
          )}
        </PopupState>
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
                  },
                }}
              >
                <MenuList dense disablePadding>
                  <MenuItem onClick={popupState.close}>
                    <Link href={"tutorial"}>Tutorial page</Link>
                  </MenuItem>
                  <MenuItem onClick={popupState.close}>
                    <Link href={"debug"}>Debug page</Link>
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
