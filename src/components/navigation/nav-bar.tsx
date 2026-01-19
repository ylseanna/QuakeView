import { Stack, Toolbar, Typography, useTheme } from "@mui/material";
import { useTranslations } from "next-intl";
import { Settings, Info, Public, TableRows } from "@mui/icons-material";
import { RotateOrbit } from "mdi-material-ui";
import { Link } from "@/i18n/routing";

export default function NavBar() {
  const t = useTranslations("Common");
  //   const locale = useLocale();

  const NavigationSections = [
    {
      section: "import",
      title: undefined,
      sections: [
        {
          segment: "/",
          title: t("configure"),
          icon: <Settings />,
        },
      ],
    },
    {
      section: "data_overview",
      title: undefined,
      sections: [
        {
          segment: "overview_map",
          title: t("overview_map"),
          icon: <Public />,
        },
        {
          segment: "overview_table",
          title: t("overview_table"),
          icon: <TableRows />,
        },
      ],
    },
    {
      section: "views",
      title: undefined,
      sections: [
        {
          segment: "3D_map",
          title: t("3D_map"),
          icon: <RotateOrbit />,
        },
      ],
    },

    {
      section: "misc",
      title: undefined,
      sections: [
        {
          segment: "information",
          title: t("information"),
          icon: <Info />,
        },
      ],
    },
  ];

  const theme = useTheme();

  return (
    <Toolbar
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.appBar,
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Stack direction="row" spacing={2}>
        {NavigationSections.map((NavigationSection) => (
          <Stack direction="row" spacing={2} key={NavigationSection.section}>
            {NavigationSection.sections.map((NavigationItem) => (
              <Link key={NavigationItem.segment} href={NavigationItem.segment}>
                <Typography>{NavigationItem.title}</Typography>
              </Link>
            ))}
          </Stack>
        ))}
      </Stack>
    </Toolbar>
  );
}
