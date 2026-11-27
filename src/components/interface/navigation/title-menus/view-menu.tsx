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
  Typography,
} from "@mui/material";

import { useTranslations } from "next-intl";
import ThemeSwitcher from "../theme-switcher";
import PopupState, {
  bindTrigger,
  bindMenu,
  bindHover,
} from "material-ui-popup-state";
import HoverMenu from "material-ui-popup-state/HoverMenu";
import { Fragment } from "react";
import { Check } from "@mui/icons-material";
import { useAppStateStore } from "@/providers/app-state-provider";
import { useKeyPressed } from "@react-hooks-library/core";

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

  const {
    appInterface: { views },
    appInterfaceActions: { viewActions },
  } = useAppStateStore((state) => state);

  useKeyPressed(["g"], (e) => {
    viewActions.toggleThreeDGroundPlaneIndicatorsVisible();
    e.preventDefault();
  });
  useKeyPressed(["e"], (e) => {
    viewActions.toggleThreeDFullExtentIndicatorsVisible();
    e.preventDefault();
  });
  useKeyPressed(["a"], (e) => {
    if (
      views.threeDDepthIndicatorsVisible &&
      views.threeDGeoExtentIndicatorsVisible
    ) {
      viewActions.toggleThreeDGeoExtentIndicatorsVisible();
      viewActions.toggleThreeDDepthIndicatorsVisible();
    } else if (
      views.threeDDepthIndicatorsVisible &&
      !views.threeDGeoExtentIndicatorsVisible
    ) {
      viewActions.toggleThreeDDepthIndicatorsVisible();
    } else if (
      views.threeDGeoExtentIndicatorsVisible &&
      !views.threeDDepthIndicatorsVisible
    ) {
      viewActions.toggleThreeDGeoExtentIndicatorsVisible();
    } else {
      viewActions.toggleThreeDGeoExtentIndicatorsVisible();
      viewActions.toggleThreeDDepthIndicatorsVisible();
    }

    e.preventDefault();
  });

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
              {/* <MenuItem
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
              </MenuItem> */}
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
              <MenuItem onClick={() => viewActions.toggleSideBarsVisible()}>
                <ListItemIcon>
                  {views.sideBarsVisible && <Check />}
                </ListItemIcon>
                <ListItemText>{t("Titlebar.show_sidebar")}</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => viewActions.toggleMapToolsVisible()}>
                <ListItemIcon>
                  {views.mapToolsVisible && <Check />}
                </ListItemIcon>
                <ListItemText>{t("Titlebar.map_tools")}</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => viewActions.togglebottombarVisible()}>
                <ListItemIcon>
                  {views.bottombarVisible && <Check />}
                </ListItemIcon>
                <ListItemText>{t("Titlebar.show_bottombar")}</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => viewActions.toggleTimelineBarVisible()}>
                <ListItemIcon>
                  {views.timelineBarVisible && <Check />}
                </ListItemIcon>
                <ListItemText>{t("Titlebar.show_timeline_bar")}</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => viewActions.toggleLegendVisible()}>
                <ListItemIcon>{views.legendVisible && <Check />}</ListItemIcon>
                <ListItemText>{t("Titlebar.show_legend")}</ListItemText>
              </MenuItem>
              <Divider />
              <PopupState variant="popover" popupId="view-popup-menu-3D">
                {(subPopupState) => (
                  <Fragment>
                    <MenuItem
                      className="noDragArea"
                      {...bindHover(subPopupState)}
                    >
                      <ListItemText>
                        {t("Titlebar.3D_map_elements")}
                      </ListItemText>
                    </MenuItem>
                    <HoverMenu
                      {...bindMenu(subPopupState)}
                      slotProps={{
                        paper: {
                          variant: "outlined",
                          sx: { width: 280, maxWidth: "100%" },
                        },
                      }}
                      transitionDuration={150}
                      sx={{ zIndex: 10000 }}
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "left",
                      }}
                    >
                      <MenuList dense disablePadding>
                        <MenuItem
                          onClick={() =>
                            viewActions.toggleThreeDDepthIndicatorsVisible()
                          }
                        >
                          <ListItemIcon>
                            {views.threeDDepthIndicatorsVisible && <Check />}
                          </ListItemIcon>
                          <ListItemText>
                            {t("Titlebar.show_3D_depth_indicators")}
                          </ListItemText>
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary" }}
                          >
                            A
                          </Typography>
                        </MenuItem>

                        <MenuItem
                          onClick={() =>
                            viewActions.toggleThreeDGeoExtentIndicatorsVisible()
                          }
                        >
                          <ListItemIcon>
                            {views.threeDGeoExtentIndicatorsVisible && (
                              <Check />
                            )}
                          </ListItemIcon>
                          <ListItemText>
                            {t("Titlebar.show_3D_geo_extent")}
                          </ListItemText>
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary" }}
                          >
                            A
                          </Typography>
                        </MenuItem>
                        <MenuItem
                          onClick={() =>
                            viewActions.toggleThreeDGroundPlaneIndicatorsVisible()
                          }
                        >
                          <ListItemIcon>
                            {views.threeDGroundPlaneIndicatorsVisible && (
                              <Check />
                            )}
                          </ListItemIcon>
                          <ListItemText>
                            {t("Titlebar.show_3D_ground_plane")}
                          </ListItemText>
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary" }}
                          >
                            G
                          </Typography>
                        </MenuItem>
                        <MenuItem
                          onClick={() =>
                            viewActions.toggleThreeDFullExtentIndicatorsVisible()
                          }
                        >
                          <ListItemIcon>
                            {views.threeDFullExtentIndicatorsVisible && (
                              <Check />
                            )}
                          </ListItemIcon>
                          <ListItemText>
                            {t("Titlebar.show_3D_full_extent")}
                          </ListItemText>
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary" }}
                          >
                            E
                          </Typography>
                        </MenuItem>
                      </MenuList>
                    </HoverMenu>
                  </Fragment>
                )}
              </PopupState>
            </MenuList>
          </Menu>
        </Fragment>
      )}
    </PopupState>
  );
}
