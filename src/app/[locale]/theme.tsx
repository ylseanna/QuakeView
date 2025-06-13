"use client";

////////////////////////////////////////////////////////////////

import { ThemeOptions, createTheme } from "@mui/material/styles";

export const theme: ThemeOptions = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#10099f",
        },
        secondary: {
          main: "#ffa05f",
        },
        error: {
          main: "#bd3e3e",
        },
        warning: {
          main: "#b76017",
        },
        info: {
          main: "#3b82a8",
        },
        success: {
          main: "#427545",
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#ffffff",
        },
        secondary: {
          main: "#ffa05f",
        },
        error: {
          main: "#bd3e3e",
        },
        warning: {
          main: "#b76017",
        },
        info: {
          main: "#3b82a8",
        },
        success: {
          main: "#427545",
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
  typography: {
    fontFamily: [
      "Archivo Variable",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    formheader: {
      fontSize: "0.8rem",
      opacity: 1,
      fontWeight: "bold",
      letterSpacing: "0.01rem",
    },
    formlabel: {
      fontSize: "0.9rem",
      opacity: 0.6,
      fontWeight: "normal",
    },
  },
  components: {
    MuiToolbar: {
      styleOverrides: {
        dense: {
          height: 24,
          minHeight: 24,
        },
      },
    },
  },
});
