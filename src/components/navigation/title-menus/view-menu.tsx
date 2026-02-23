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
  ListItemIcon,
} from "@mui/material";

import { useTranslations } from "next-intl";
import LanguageSwitcher from "../language-switcher";
import ThemeSwitcher from "../theme-switcher";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { Fragment } from "react";
import { Check } from "@mui/icons-material";
import { useAppStateStore } from "@/providers/app-state-provider";

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

export default function ViewMenu() {
  const theme = useTheme() as Theme;

  const t = useTranslations();

  const { appInterface, appInterfaceActions } = useAppStateStore(
    (state) => state,
  );

  return (
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
            transitionDuration={150}
          >
            <MenuList dense disablePadding>
              <MenuItem
                sx={{
                  pt: 0,
                  pb: 0,
                  cursor: "initial",
                  ":hover": { background: "None" },
                }}
                disableRipple
              >
                <ListItemText>{t("Titlebar.language")}</ListItemText>
                <LanguageSwitcher />
              </MenuItem>
              <MenuItem
                sx={{
                  pt: 0,
                  pb: 0,
                  cursor: "initial",
                  ":hover": { background: "None" },
                }}
                disableRipple
              >
                <ListItemText>{t("Titlebar.theme")}</ListItemText>
                <ThemeSwitcher />
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => appInterfaceActions.toggleSideBarsVisible()}
              >
                <ListItemIcon>
                  {appInterface.sideBarsVisible && <Check />}
                </ListItemIcon>
                <ListItemText>{t("Titlebar.show_sidebar")}</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => appInterfaceActions.toggleMapToolsVisible()}
              >
                <ListItemIcon>
                  {appInterface.mapToolsVisible && <Check />}
                </ListItemIcon>
                <ListItemText>{t("Titlebar.map_tools")}</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() =>
                  appInterfaceActions.togglebottombarVisible()
                }
              >
                <ListItemIcon>
                  {appInterface.bottombarVisible && <Check />}
                </ListItemIcon>
                <ListItemText>
                  {t("Titlebar.show_bottombar")}
                </ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => appInterfaceActions.toggleTimelineBarVisible()}
              >
                <ListItemIcon>
                  {appInterface.timelineBarVisible && <Check />}
                </ListItemIcon>
                <ListItemText>{t("Titlebar.show_timeline_bar")}</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => appInterfaceActions.toggleLegendVisible()}
              >
                <ListItemIcon>
                  {appInterface.legendVisible && <Check />}
                </ListItemIcon>
                <ListItemText>{t("Titlebar.show_legend")}</ListItemText>
              </MenuItem>
            </MenuList>
          </Menu>
        </Fragment>
      )}
    </PopupState>
  );
}
