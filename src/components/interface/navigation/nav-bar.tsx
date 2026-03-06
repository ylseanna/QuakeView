import PopupState, { bindContextMenu, bindMenu } from "material-ui-popup-state";
import { OpenInNew, Public, Settings, TableRows } from "@mui/icons-material";
import { ChartHistogram, ChartMultiple, ChartPpf, RotateOrbit, ScatterPlot } from "mdi-material-ui";
import { Box, Button, Divider, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, Stack, Toolbar, Typography, useTheme } from "@mui/material";
import { useTranslations } from "next-intl";
import { Fragment } from "react";

import { Link, usePathname } from "@/i18n/routing";

export default function NavBar() {
  const t = useTranslations();
  const pathname = usePathname();

  const NavigationSections = [
    {
      section: "import",
      title: t("Common.input"),
      sections: [
        {
          segment: "/",
          title: t("Common.configure"),
          icon: <Settings />,
          enabled: true,
        },
      ],
    },
    {
      section: "data",
      title: t("Common.data"),
      sections: [
        {
          segment: "/overview_table",
          title: t("Common.overview_table"),
          icon: <TableRows />,
          enabled: true,
        },
      ],
    },
    {
      section: "views",
      title: t("Common.views"),
      sections: [
        {
          segment: "/overview_map",
          title: t("Common.overview_map"),
          icon: <Public />,
          enabled: true,
        },
        {
          segment: "/3D_map",
          title: t("Common.3D"),
          icon: <RotateOrbit />,
          enabled: true,
        },
      ],
    },
    {
      section: "plots",
      title: t("Common.plots"),
      sections: [
        {
          segment: "/plots/stem_plot",
          title: t("Navbar.stem_plot"),
          icon: <ScatterPlot />,
          enabled: true,
        },
        {
          segment: "/plots/GR_plot",
          title: t("Navbar.GR_plot"),
          icon: <ChartPpf />,
          enabled: true,
        },
        {
          segment: "/plots/distribution_plot",
          title: t("Navbar.distribution_plot"),
          icon: <ChartHistogram />,
          enabled: true,
        },
      ],
    },

    // {
    //   section: "misc",
    //   title: undefined,
    //   sections: [
    //     {
    //       segment: "information",
    //       title: t("information"),
    //       icon: <Info />,
    //     },
    //   ],
    // },
  ];

  const theme = useTheme();

  return (
    <Toolbar
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.appBar,
        backgroundColor: theme.palette.background.default,
        p: 0,
        height: "80px",
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        divider={<Divider orientation="vertical" flexItem />}
        sx={{ height: "80px", alignItems: "center" }}
      >
        {NavigationSections.map((NavigationSection) => (
          <Box
            key={NavigationSection.section}
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "64px",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="navsectionheader"
              sx={{
                color: theme.palette.text.primary,
                height: "0.6rem",
                mb: "4px",
              }}
            >
              {NavigationSection.title}
            </Typography>
            <Stack direction="row" spacing={2}>
              {NavigationSection.sections.map((NavigationItem) => (
                <PopupState
                  key={NavigationItem.segment}
                  variant="popover"
                  popupId="demoMenu"
                >
                  {(popupState) => (
                    <Fragment>
                      <Link
                        href={NavigationItem.segment}
                        {...bindContextMenu(popupState)}
                      >
                        <Button
                          sx={{
                            color:
                              pathname == NavigationItem.segment
                                ? theme.palette.primary.main
                                : theme.palette.text.primary,
                            opacity: 0.87,
                            flexDirection: "column",
                            justifyContent: "center",
                            p: "4px",
                            fontSize: "0.8rem",
                            textTransform: "capitalize",
                          }}
                          disabled={!NavigationItem.enabled}
                        >
                          {NavigationItem.icon}
                          {NavigationItem.title}
                        </Button>
                      </Link>
                      <Menu
                        {...{
                          ...bindMenu(popupState),
                        }}
                        slotProps={{
                          paper: { variant: "outlined", sx: { padding: 0 } },
                        }}
                      >
                        <MenuList dense disablePadding sx={{ margin: 0 }}>
                          <MenuItem onClick={popupState.close} disabled>
                            <ListItemIcon>
                              <OpenInNew fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>
                              {t("Navbar.open_in_window", {
                                page: NavigationItem.title,
                              })}
                            </ListItemText>
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Fragment>
                  )}
                </PopupState>
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Toolbar>
  );
}
