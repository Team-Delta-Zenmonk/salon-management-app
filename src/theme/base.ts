import React from "react";

declare module "@mui/material/styles" {
  interface Theme {
    colors: {
      medium: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
      };
    };
    general: {
      borderColor: string;
      placeholderColor: string;
    };
    fontWeight: {
      bold: number;
      semiBold: number;
      regular: number;
    };
  }

  interface ThemeOptions {
    colors: {
      medium: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
      };
    };
    general: {
      borderColor: string;
      placeholderColor: string;
    };
    fontWeight: {
      bold: number;
      semiBold: number;
      regular: number;
    };
  }

  interface TypographyVariants {
    paragraphLg: React.CSSProperties;
    paragraphMd: React.CSSProperties;
    paragraphSm: React.CSSProperties;
    paragraphXs: React.CSSProperties;
    paragraphButton: React.CSSProperties;
    paragraphTable: React.CSSProperties;
    titleLg: React.CSSProperties;
    titleMd: React.CSSProperties;
    titleSm: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    paragraphLg?: React.CSSProperties;
    paragraphMd?: React.CSSProperties;
    paragraphSm?: React.CSSProperties;
    paragraphXs?: React.CSSProperties;
    paragraphButton?: React.CSSProperties;
    paragraphTable?: React.CSSProperties;
    titleLg?: React.CSSProperties;
    titleMd?: React.CSSProperties;
    titleSm?: React.CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    paragraphLg: true;
    paragraphMd: true;
    paragraphSm: true;
    paragraphXs: true;
    paragraphButton: true;
    paragraphTable: true;
    titleLg: true;
    titleMd: true;
    titleSm: true;
  }
}
