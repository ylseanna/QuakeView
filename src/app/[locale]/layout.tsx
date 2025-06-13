import "./globals.css";

import { Viewport } from "next";

export const metadata = {
  title: "Earthquake Visualisation Web App",
};

export const viewport: Viewport = {
  initialScale: 1,
  width: "device-width",
};

import "@fontsource-variable/archivo";

import { Suspense, ReactNode } from "react";

import LinearProgress from "@mui/material/LinearProgress";

import { theme } from "./theme";

import { NextAppProvider } from "@toolpad/core/nextjs";
import { getTranslations } from "next-intl/server";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { AppTheme } from "@toolpad/core";

import { ProjectStoreProvider } from "@/providers/project-store-provider";

declare module "@mui/material/styles" {
  interface TypographyVariants {
    formlabel: React.CSSProperties;
    formheader: React.CSSProperties;
  }

  // allow configuration using `createTheme()`
  interface TypographyVariantsOptions {
    formlabel?: React.CSSProperties;
    formheader?: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    formlabel: true;
    formheader: true;
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

  const t = await getTranslations("Common");

  const BRANDING = await {
    title: t("app_title"),
    logo: "",
  };

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <AppRouterCacheProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <Suspense fallback={<LinearProgress />}>
              <NextAppProvider
                theme={theme as AppTheme}
                branding={BRANDING}
                // router={router}
              >
                <ProjectStoreProvider>{children}</ProjectStoreProvider>
              </NextAppProvider>
            </Suspense>
          </NextIntlClientProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
