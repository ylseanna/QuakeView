import { Viewport } from "next";

import "./globals.css";

export const metadata = {
  title: "Earthquake Visualisation Web App",
};

export const viewport: Viewport = {
  initialScale: 1,
  width: "device-width",
};

import "@fontsource-variable/archivo";
import "@fontsource-variable/ibm-plex-sans";

import { theme } from "./theme";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

import { ProjectStoreProvider } from "@/providers/project-store-provider";
import { DataStoreProvider } from "@/providers/data-store-provider";
import { ThemeProvider } from "@mui/material/styles";
import { ReactNode } from "react";

declare module "@mui/material/styles" {
  interface TypographyVariants {
    formlabel: React.CSSProperties;
    formheader: React.CSSProperties;
    navsectionheader: React.CSSProperties;
  }

  // allow configuration using `createTheme()`
  interface TypographyVariantsOptions {
    formlabel?: React.CSSProperties;
    formheader?: React.CSSProperties;
    navsectionheader?: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    formlabel: true;
    formheader: true;
    navsectionheader: true;
  }
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    electronAPI: any;
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as never)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <AppRouterCacheProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeProvider {...{ theme: theme, forceThemeRerender: true }}>
              <ProjectStoreProvider>
                <DataStoreProvider>{children}</DataStoreProvider>
              </ProjectStoreProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
