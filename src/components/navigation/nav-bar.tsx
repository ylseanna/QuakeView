import InfoIcon from "@mui/icons-material/Info";
import PublicIcon from "@mui/icons-material/Public";
import TableRowsIcon from "@mui/icons-material/TableRows";
import { Stack, Toolbar, Typography, useTheme } from "@mui/material";
import { useTranslations } from "next-intl";
import { Settings } from "@mui/icons-material";
import { RotateOrbit } from "mdi-material-ui";
import { Link } from "@/i18n/routing";

export default function NavBar() {
  const t = useTranslations("Common");
//   const locale = useLocale();

  const NavigationItems = [
    {
      segment: "/",
      title: t("configure"),
      icon: <Settings />,
    },
    {
      segment: "overview_map",
      title: t("overview_map"),
      icon: <PublicIcon />,
    },
    {
      segment: "overview_table",
      title: t("overview_table"),
      icon: <TableRowsIcon />,
    },
    {
      segment: "3D_map",
      title: t("3D_map"),
      icon: <RotateOrbit />,
    },
    {
      segment: "information",
      title: t("information"),
      icon: <InfoIcon />,
    },
  ];

  const theme = useTheme();

  return (
    <Toolbar sx={{ borderBottom: `1px solid ${theme.palette.divider}`}}>
      <Stack direction="row" spacing={2}>
        {NavigationItems.map((NavigationItem) => (
          <Link key={NavigationItem.segment} href={NavigationItem.segment}>
            <Typography>{NavigationItem.title}</Typography>
          </Link>
        ))}
      </Stack>
    </Toolbar>
  );
}
