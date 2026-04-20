"use-client";

import { Button, Tooltip } from "@mui/material";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";

import { SxTopNavButton } from "../title-bar";


export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  // Change locale programmatically to prevent page from reloading
  function changeLocale(locale: string) {
    console.log(locale);
    router.push(pathname, { locale: locale });
  }

  return (
    <div id="lngSwitcher">
      {locale === "is" ? (
        <Tooltip title="Switch to English">
          <Link
            className="link"
            href={pathname}
            locale="en-US"
            onClick={(event) => {
              event.preventDefault();
              changeLocale("en-US");
            }}
          >
            <Button
              variant="text"
              sx={{ ...SxTopNavButton, textTransform: "caps" }}
            >
              en
            </Button>
          </Link>
        </Tooltip>
      ) : (
        <Tooltip title="Skipta yfir í íslensku">
          <Link
            className="link"
            href={pathname}
            locale="is"
            onClick={(event) => {
              event.preventDefault();
              changeLocale("is");
            }}
          >
            <Button
              variant="text"
              sx={{ ...SxTopNavButton, textTransform: "caps" }}
            >
              is
            </Button>
          </Link>
        </Tooltip>
      )}
    </div>
  );
}
