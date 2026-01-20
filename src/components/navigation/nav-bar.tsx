import {
  Button,
  Divider,
  Stack,
  Toolbar,
  useTheme,
  Box,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { Settings, Public, TableRows } from "@mui/icons-material";
import { RotateOrbit, ChartMultiple, ChartPpf, ChartHistogram } from "mdi-material-ui";
import { Link, usePathname } from "@/i18n/routing";

export default function NavBar() {
  const t = useTranslations("Common");
  const pathname = usePathname();
    console.log(pathname)


  const NavigationSections = [
    {
      section: "import",
      title: t("data"),
      sections: [
        {
          segment: "/",
          title: t("configure"),
          icon: <Settings />,
          enabled: true,
        },
      ],
    },
    {
      section: "data_overview",
      title: t("data_overview"),
      sections: [
        {
          segment: "/overview_map",
          title: t("overview_map"),
          icon: <Public />,
          enabled: true,
        },
        {
          segment: "/overview_table",
          title: t("overview_table"),
          icon: <TableRows />,
          enabled: false,
        },
      ],
    },
    {
      section: "views",
      title: t("views"),
      sections: [
        {
          segment: "/3D_map",
          title: t("3D_map"),
          icon: <RotateOrbit />,
          enabled: true,
        },
        {
          segment: "/plots",
          title: t("all_plots"),
          icon: <ChartMultiple />,
          enabled: true,
        },
      ],
    },
    {
      section: "plots",
      title: t("plots"),
      sections: [
        {
          segment: "/plots/GRplot",
          title: t("GRplot"),
          icon: <ChartPpf />,
          enabled: true,
        },
        {
          segment: "/plots/distributionplot",
          title: t("distributionplot"),
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
                <Link
                  key={NavigationItem.segment}
                  href={NavigationItem.segment}
                >
                  <Button
                    sx={{
                      color: (pathname == NavigationItem.segment) ? theme.palette.primary.main :  theme.palette.text.primary ,
                      opacity: .87,
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
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Toolbar>
  );
}
