"use client";

import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  Theme,
  useTheme,
} from "@mui/material";

import { useTranslations } from "next-intl";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { Fragment } from "react";

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

export default function FileMenu() {
  const theme = useTheme() as Theme;

  const t = useTranslations();

  return (
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
            transitionDuration={150}
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
  );
}
