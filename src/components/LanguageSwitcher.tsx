"use client";

import { useLocale } from "next-intl";
import Button from "@mui/material/Button";

import { Link, useRouter, usePathname } from "@/i18n/routing";

import { Tooltip } from "@mui/material";
import { MouseEvent } from "react";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  // Change locale programmatically to prevent page from reloading
  function changeLocale(locale: string) {
    router.push(pathname, { locale: locale });
  }

  const offset = {
    popper: {
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [0, 15],
          },
        },
      ],
    },
  };

  return (
    <div id="lngSwitcher">
      {locale === "is" ? (
        <Tooltip slotProps={offset} title="Switch to English">
          <Link
            className="link"
            href={pathname}
            locale="en"
            onClick={(e: MouseEvent) => {
              e.preventDefault();
              changeLocale("en");
            }}
          >
            <Button variant="text">en</Button>
          </Link>
        </Tooltip>
      ) : (
        <Tooltip slotProps={offset} title="Skipta yfir í íslensku">
          <Link
            className="link"
            href={pathname}
            locale="is"
            onClick={(e: MouseEvent) => {
              e.preventDefault();
              changeLocale("is");
            }}
          >
            <Button variant="text">is</Button>
          </Link>
        </Tooltip>
      )}
    </div>
  );
}
