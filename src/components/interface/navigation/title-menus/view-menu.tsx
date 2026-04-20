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
// import LanguageSwitcher from "../switchers/language-switcher";
import ThemeSwitcher from "../switchers/theme-switcher";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { Fragment } from "react";
import { Check } from "@mui/icons-material";
import { useAppStateStore } from "@/providers/app-state-provider";
import DayFormatSwitcher from "../switchers/day-format-switcher";

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

  const { appInterface: { views }, appInterfaceActions: { viewActions } } = useAppStateStore(
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
            sx={{ zIndex: 10000 }}
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
                <ListItemText>{t("Titlebar.dayFormat")}</ListItemText>
                <DayFormatSwitcher />
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
                onClick={() => viewActions.toggleSideBarsVisible()}
              >
                <ListItemIcon>
                  {views.sideBarsVisible && <Check />}
                </ListItemIcon>
                <ListItemText>{t("Titlebar.show_sidebar")}</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => viewActions.toggleMapToolsVisible()}
              >
                <ListItemIcon>
                  {views.mapToolsVisible && <Check />}
                </ListItemIcon>
                <ListItemText>{t("Titlebar.map_tools")}</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() =>
                  viewActions.togglebottombarVisible()
                }
              >
                <ListItemIcon>
                  {views.bottombarVisible && <Check />}
                </ListItemIcon>
                <ListItemText>
                  {t("Titlebar.show_bottombar")}
                </ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => viewActions.toggleTimelineBarVisible()}
              >
                <ListItemIcon>
                  {views.timelineBarVisible && <Check />}
                </ListItemIcon>
                <ListItemText>{t("Titlebar.show_timeline_bar")}</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => viewActions.toggleLegendVisible()}
              >
                <ListItemIcon>
                  {views.legendVisible && <Check />}
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
