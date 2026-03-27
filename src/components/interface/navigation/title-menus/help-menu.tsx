"use client";

import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  Theme,
  useTheme,
  Divider,
  ListItemText,
  Typography,
  ListItemIcon,
} from "@mui/material";

import { useTranslations } from "next-intl";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { Fragment } from "react";
import { useAppStateStore } from "@/providers/app-state-provider";
import { Check, Github, OpenInNew } from "mdi-material-ui";

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

export default function HelpMenu() {
  const theme = useTheme() as Theme;

  const t = useTranslations();

  const {
    appInterface: { views },
    appInterfaceActions: { viewActions },
  } = useAppStateStore((state) => state);

  return (
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
            transitionDuration={150}
            sx={{ zIndex: 10000 }}
          >
            <MenuList dense disablePadding>
              {/* <MenuItem onClick={popupState.close}>
                      <Link href={"tutorial"}>Tutorial page</Link>
                    </MenuItem>
                    <Divider /> */}
              <MenuItem
                sx={{
                  pt: 0,
                  pb: 0,
                }}
                onClick={() => {
                  window.electronAPI.openExternal(
                    "https://quakeview.readthedocs.io/",
                  );
                }}
              >
                <ListItemText>
                  {t("Titlebar.documentation")}{" "}
                  <span style={{ opacity: 0.6 }}>
                    ({t("Titlebar.external_link")})
                  </span>
                </ListItemText>
                <OpenInNew sx={{ fontSize: "1.1rem", opacity: 0.6 }} />
              </MenuItem>
              <MenuItem
                sx={{
                  pt: 0,
                  pb: 0,
                }}
                onClick={() => {
                  window.electronAPI.openExternal(
                    "https://github.com/ylseanna/QuakeView",
                  );
                }}
              >
                <ListItemText>
                  {t("Titlebar.github_repo")}{" "}
                  <span style={{ opacity: 0.6 }}>
                    ({t("Titlebar.external_link")})
                  </span>
                </ListItemText>
                <OpenInNew sx={{ fontSize: "1.1rem", opacity: 0.6 }} />
              </MenuItem>
              <Divider />
              <MenuItem
                sx={{
                  pt: 0,
                  pb: 0,
                }}
                onClick={() => {
                  viewActions.toggleDebugVisible();
                }}
              >
                <ListItemText>
                  {!views.debugVisible
                    ? t("Titlebar.debug_window")
                    : t("Titlebar.hide_debug_window")}
                </ListItemText>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  F3
                </Typography>
              </MenuItem>
            </MenuList>
          </Menu>
        </Fragment>
      )}
    </PopupState>
  );
}
