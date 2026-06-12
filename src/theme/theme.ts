"use client";
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

const myTheme = {
  white: "#ffffff",
  black: "#000000",
  alternate: "#F7F9FC",
  backgroundBg: "#f3f4f6",
  surface: "#ffffff",
  surfaceMuted: "#f9fafb",
  borderSubtle: "#e5e7eb",
  textPrimary: "#111827",
  textMuted: "#6b7280",
  focusRing: "rgba(13, 148, 136, 0.5)",
  scrollbarBg: "#F3F4F6",
  scrollbarThumbBg: "#D1D5DB",
  logoBackground: "#F8F8F8",
  borderRadius: 8,
};

const breakpoints = createTheme().breakpoints;
export const colors = {
  neutral: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#EEEEEE",
    300: "#E0E0E0",
    400: "#BDBDBD",
    500: "#9E9E9E",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },
  primary: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
  accent: {
    50: "#f0fdfa",
    100: "#ccfbf1",
    200: "#99f6e4",
    300: "#5eead4",
    400: "#2dd4bf",
    500: "#14b8a6",
    600: "#0d9488",
    700: "#0f766e",
    800: "#115e59",
    900: "#134e4a",
  },
  critical: {
    50: "#FFEBEE",
    100: "#FFCDD2",
    200: "#EF9A9A",
    300: "#E57373",
    400: "#EF5350",
    500: "#F44336",
    600: "#E53935",
    700: "#D32F2F",
    800: "#C62828",
    900: "#B71C1C",
  },
  high: {
    50: "#FFF3E0",
    100: "#FFE0B2",
    200: "#FFCC80",
    300: "#FFB74D",
    400: "#FFA726",
    500: "#FF9800",
    600: "#FB8C00",
    700: "#F57C00",
    800: "#EF6C00",
    900: "#E65100",
  },
  medium: {
    50: "#FFFDE7",
    100: "#FFF9C4",
    200: "#FFF59D",
    300: "#FFF176",
    400: "#FFEE58",
    500: "#FFEB3B",
    600: "#FDD835",
    700: "#FBC02D",
    800: "#F9A825",
    900: "#F57F17",
  },
  success: {
    50: "#E8F5E9",
    100: "#C8E6C9",
    200: "#A5D6A7",
    300: "#81C784",
    400: "#66BB6A",
    500: "#4CAF50",
    600: "#43A047",
    700: "#388E3C",
    800: "#2E7D32",
    900: "#1B5E20",
  },
  info: {
    50: "#E8F0FE",
    100: "#C4D9FD",
    200: "#9DBFFB",
    300: "#76A6F9",
    400: "#4F8DF8",
    500: "#2873F6",
    600: "#0A5CEB",
    700: "#084DC4",
    800: "#073E9D",
    900: "#052E76",
  },
  experimental: {
    50: "#F9F6FD",
    100: "#F4EFFC",
    200: "#E8DEF8",
    300: "#DBCFED",
    400: "#4F8DF8",
    500: "#9585C0",
    600: "#7E6AB1",
    700: "#6750A4",
    800: "#513D87",
    900: "#473675",
  },
};

const fontWeight = {
  bold: 700,
  semiBold: 600,
  regular: 400,
};

const theme = createTheme({
  colors: {
    medium: {
      50: colors.medium[50],
      100: colors.medium[100],
      200: colors.medium[200],
      300: colors.medium[300],
      400: colors.medium[400],
      500: colors.medium[500],
      600: colors.medium[600],
      700: colors.medium[700],
      800: colors.medium[800],
      900: colors.medium[900],
    },
  },
  general: {
    borderColor: colors.neutral[300],
    placeholderColor: colors.neutral[500],
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 700,
      md: 960,
      lg: 1280,
      xl: 1840,
    },
  },
  palette: {
    mode: "light",
    common: {
      black: myTheme.black,
      white: myTheme.white,
    },
    primary: {
      light: colors.primary[50],
      main: colors.primary[900],
      dark: colors.primary[900],
      50: colors.primary[50],
      100: colors.primary[100],
      200: colors.primary[200],
      300: colors.primary[300],
      400: colors.primary[400],
      500: colors.primary[500],
      600: colors.primary[600],
      700: colors.primary[700],
      800: colors.primary[800],
      900: colors.primary[900],
    },
    secondary: {
      light: colors.neutral[50],
      main: colors.neutral[800],
      dark: colors.neutral[900],
      50: colors.neutral[50],
      100: colors.neutral[100],
      200: colors.neutral[200],
      300: colors.neutral[300],
      400: colors.neutral[400],
      500: colors.neutral[500],
      600: colors.neutral[600],
      700: colors.neutral[700],
      800: colors.neutral[800],
      900: colors.neutral[900],
    },
    error: {
      light: colors.critical[50],
      main: colors.critical[600],
      dark: colors.critical[900],
      50: colors.critical[50],
      100: colors.critical[100],
      200: colors.critical[200],
      300: colors.critical[300],
      400: colors.critical[400],
      500: colors.critical[500],
      600: colors.critical[600],
      700: colors.critical[700],
      800: colors.critical[800],
      900: colors.critical[900],
    },
    success: {
      light: colors.success[50],
      main: colors.success[600],
      dark: colors.success[900],
      50: colors.success[50],
      100: colors.success[100],
      200: colors.success[200],
      300: colors.success[300],
      400: colors.success[400],
      500: colors.success[500],
      600: colors.success[600],
      700: colors.success[700],
      800: colors.success[800],
      900: colors.success[900],
    },
    info: {
      light: colors.info[50],
      main: colors.info[500],
      dark: colors.info[900],
      50: colors.info[50],
      100: colors.info[100],
      200: colors.info[200],
      300: colors.info[300],
      400: colors.info[400],
      500: colors.info[500],
      600: colors.info[600],
      700: colors.info[700],
      800: colors.info[800],
      900: colors.info[900],
    },
    warning: {
      light: colors.high[50],
      main: colors.high[600],
      dark: colors.high[900],
      50: colors.high[50],
      100: colors.high[100],
      200: colors.high[200],
      300: colors.high[300],
      400: colors.high[400],
      500: colors.high[500],
      600: colors.high[600],
      700: colors.high[700],
      800: colors.high[800],
      900: colors.high[900],
    },
    background: {
      paper: myTheme.white,
      default: myTheme.backgroundBg,
    },
  },
  shape: {
    borderRadius: myTheme.borderRadius,
  },
  typography: {
    fontFamily: '"Inter", "sans-serif" !important',
    fontWeightBold: fontWeight.bold,
    fontWeightMedium: fontWeight.semiBold,
    fontWeightLight: fontWeight.regular,
    h1: {
      fontSize: "22px",
      lineHeight: 1.25,
    },
    h2: {
      fontSize: "18px",
      lineHeight: 1.28,
    },
    h3: {
      fontSize: "16px",
      lineHeight: 1.44,
    },
    h4: {
      fontSize: "15px",
      lineHeight: 1.45,
    },
    h5: {
      fontSize: "14px",
      lineHeight: 1.4,
    },
    h6: {
      fontSize: "13px",
      lineHeight: 1.33,
    },
    paragraphLg: {
      fontSize: "16px",
      lineHeight: 1.5,
    },
    paragraphMd: {
      fontSize: "14px",
      lineHeight: 1.42,
    },
    paragraphSm: {
      fontSize: "12px",
      lineHeight: 1.66,
    },
    paragraphXs: {
      fontSize: "11px",
      lineHeight: 1.45,
    },
    paragraphButton: {
      fontSize: "14px",
      lineHeight: 1.85,
    },
    paragraphTable: {
      fontSize: "13px",
      lineHeight: 1.38,
    },
    titleLg: {
      fontSize: "22px",
      lineHeight: 1.45,
    },
    titleMd: {
      fontSize: "20px",
      lineHeight: 1.4,
    },
    titleSm: {
      fontSize: "18px",
      lineHeight: 1.33,
    },
  },
  fontWeight: {
    bold: fontWeight.bold,
    semiBold: fontWeight.semiBold,
    regular: fontWeight.regular,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          padding: 0,
          margin: 0,
          overflow: "hidden",
        },
        "::-webkit-scrollbar": {
          height: "8px",
          width: "8px",
          backgroundColor: myTheme.scrollbarBg,
        },
        "::-webkit-scrollbar-thumb": {
          backgroundColor: myTheme.scrollbarThumbBg,
          borderRadius: "10px",
        },
        "::-webkit-scrollbar-track": {
          borderRadius: "10px",
        },
        ":root": {
          "--surface": myTheme.surface,
          "--surface-muted": myTheme.surfaceMuted,
          "--border-subtle": myTheme.borderSubtle,
          "--text-primary": myTheme.textPrimary,
          "--text-muted": myTheme.textMuted,
          "--focus-ring": myTheme.focusRing,
          "--accent": colors.accent[600],
          "--accent-light": colors.accent[50],
          "--accent-dark": colors.accent[900],
          "--accent-50": colors.accent[50],
          "--accent-100": colors.accent[100],
          "--accent-200": colors.accent[200],
          "--accent-300": colors.accent[300],
          "--accent-400": colors.accent[400],
          "--accent-500": colors.accent[500],
          "--accent-600": colors.accent[600],
          "--accent-700": colors.accent[700],
          "--accent-800": colors.accent[800],
          "--accent-900": colors.accent[900],
          "--white": myTheme.white,
          "--black": myTheme.black,
          "--background": myTheme.backgroundBg,
          "--foreground": myTheme.alternate,
          "--primary": colors.primary[900],
          "--primary-light": colors.primary[50],
          "--primary-dark": colors.primary[900],
          "--primary-50": colors.primary[50],
          "--primary-100": colors.primary[100],
          "--primary-200": colors.primary[200],
          "--primary-300": colors.primary[300],
          "--primary-400": colors.primary[400],
          "--primary-500": colors.primary[500],
          "--primary-600": colors.primary[600],
          "--primary-700": colors.primary[700],
          "--primary-800": colors.primary[800],
          "--primary-900": colors.primary[900],
          "--secondary": colors.neutral[800],
          "--secondary-light": colors.neutral[50],
          "--secondary-dark": colors.neutral[900],
          "--secondary-50": colors.neutral[50],
          "--secondary-100": colors.neutral[100],
          "--secondary-200": colors.neutral[200],
          "--secondary-300": colors.neutral[300],
          "--secondary-400": colors.neutral[400],
          "--secondary-500": colors.neutral[500],
          "--secondary-600": colors.neutral[600],
          "--secondary-700": colors.neutral[700],
          "--secondary-800": colors.neutral[800],
          "--secondary-900": colors.neutral[900],
          "--error": colors.critical[600],
          "--error-light": colors.critical[50],
          "--error-dark": colors.critical[900],
          "--error-50": colors.critical[50],
          "--error-100": colors.critical[100],
          "--error-200": colors.critical[200],
          "--error-300": colors.critical[300],
          "--error-400": colors.critical[400],
          "--error-500": colors.critical[500],
          "--error-600": colors.critical[600],
          "--error-700": colors.critical[700],
          "--error-800": colors.critical[800],
          "--error-900": colors.critical[900],
          "--success": colors.success[600],
          "--success-light": colors.success[50],
          "--success-dark": colors.success[900],
          "--success-50": colors.success[50],
          "--success-100": colors.success[100],
          "--success-200": colors.success[200],
          "--success-300": colors.success[300],
          "--success-400": colors.success[400],
          "--success-500": colors.success[500],
          "--success-600": colors.success[600],
          "--success-700": colors.success[700],
          "--success-800": colors.success[800],
          "--success-900": colors.success[900],
          "--info": colors.info[500],
          "--info-light": colors.info[50],
          "--info-dark": colors.info[900],
          "--info-50": colors.info[50],
          "--info-100": colors.info[100],
          "--info-200": colors.info[200],
          "--info-300": colors.info[300],
          "--info-400": colors.info[400],
          "--info-500": colors.info[500],
          "--info-600": colors.info[600],
          "--info-700": colors.info[700],
          "--info-800": colors.info[800],
          "--info-900": colors.info[900],
          "--warning": colors.high[600],
          "--warning-light": colors.high[50],
          "--warning-dark": colors.high[900],
          "--warning-50": colors.high[50],
          "--warning-100": colors.high[100],
          "--warning-200": colors.high[200],
          "--warning-300": colors.high[300],
          "--warning-400": colors.high[400],
          "--warning-500": colors.high[500],
          "--warning-600": colors.high[600],
          "--warning-700": colors.high[700],
          "--warning-800": colors.high[800],
          "--warning-900": colors.high[900],
          "--experimental-light": colors.experimental[50],
          "--experimental-dark": colors.experimental[900],
          "--experimental-50": colors.experimental[50],
          "--experimental-100": colors.experimental[100],
          "--experimental-200": colors.experimental[200],
          "--experimental-300": colors.experimental[300],
          "--experimental-400": colors.experimental[400],
          "--experimental-500": colors.experimental[500],
          "--experimental-600": colors.experimental[600],
          "--experimental-700": colors.experimental[700],
          "--experimental-800": colors.experimental[800],
          "--experimental-900": colors.experimental[900],
          "--border-color": colors.neutral[300],
          "--placeholder-color": colors.neutral[500],
          "--border-radius": myTheme.borderRadius,
          "--logo-background": myTheme.logoBackground,
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          fontSize: "22px",
          lineHeight: 1.25,
        },
        h2: {
          fontSize: "18px",
          lineHeight: 1.28,
        },
        h3: {
          fontSize: "16px",
          lineHeight: 1.44,
        },
        h4: {
          fontSize: "15px",
          lineHeight: 1.45,
        },
        h5: {
          fontSize: "14px",
          lineHeight: 1.4,
          color: "var(--text-primary)",
        },
        h6: {
          fontSize: "13px",
          lineHeight: 1.33,
          color: "var(--text-muted)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          height: "38px",
          whiteSpace: "nowrap",
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 500,
          "&:hover, &.MuiSelected": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          "& .MuiInputBase-root": {
            fontSize: "14px",
            height: ownerState.size === "medium" ? "42px" : "auto",
            transition: "all 0.2s ease",
            backgroundColor: "var(--surface)",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--border-subtle)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--accent-500)",
              borderWidth: "1px",
            },
          },
        }),
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: "14px",
          color: "var(--secondary)",
          "&.MuiInputBase-multiline": {
            padding: "8px 12px 8px 16px",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          fontSize: "14px",
          fontWeight: 500,
          color: "var(--secondary)",
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: "14px",
          color: "var(--secondary-600)",
          "&.MuiInputLabel-root .Mui-focused": {
            fontSize: "12px",
          },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "14px",
          color: "var(--secondary-600)",
          transform: "translate(14px, 11px) scale(1)",
        },
        shrink: {
          fontSize: "14px",
          transform: "translate(14px, -9px) scale(0.85)",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          "&.MuiDialog-paper": {
            color: "var(--text-primary)",
            borderRadius: "12px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          },
          "&.MuiDrawer-paper": {
            borderLeft: "1px solid var(--border-subtle)",
            boxShadow: "-4px 0 15px rgba(0, 0, 0, 0.05)",
          },
          "&.MuiMenu-paper": {
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
            border: "1px solid var(--border-subtle)",
          }
        },
      },
    },

    MuiRadio: {
      styleOverrides: {
        root: {
          color: "var(--secondary-700)",
          "&.Mui-checked": {
            color: "var(--primary)",
            ".MuiSvgIcon-root": {
              color: "var(--primary)",
            },
          },

          "&.Mui-disabled.Mui-checked": {
            color: "var(--secondary-400)",
            ".MuiSvgIcon-root": {
              color: "var(--secondary-400)",
            },
          },
        },
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: "8px",
          color: "var(--secondary-700)",
          "&.Mui-checked": {
            color: "var(--primary)",
            ".MuiSvgIcon-root": {
              color: "var(--primary)",
            },
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontSize: "11px",
          color: "var(--error)",
        },
      },
    },
    MuiStepButton: {
      styleOverrides: {
        root: {
          display: "flex",
          justifyContent: "center",
          padding: 4,
        },
      },
    },
    MuiStep: {
      styleOverrides: {
        root: {
          display: "flex",
          justifyContent: "center",
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        root: {
          fontFamily: "Inter",
        },
        label: {
          textAlign: "center",
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          [breakpoints.up("sm")]: {
            display: "flex",
          },
        },
      },
    },
    MuiMobileStepper: {
      styleOverrides: {
        root: {
          [breakpoints.up("md")]: {
            display: "none",
          },
          backgroundColor: "#fff",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          height: "42px",
          backgroundColor: "var(--surface)",
          transition: "all 0.2s ease",
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--accent-500)",
            borderWidth: "1px",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--border-subtle)",
          },
          ".MuiSvgIcon-root": {
            fontSize: "20px",
          },
          "&.Mui-error .MuiSvgIcon-root": {
            color: "red",
          },
          borderRadius: "8px",
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          fontSize: "20px",
          color: "var(--secondary)",
          "&.MuiAvatar-fallback": {
            color: "var(--secondary-light)",
          },
          ".Mui-disabled &": {
            color: "var(--secondary-400)",
          },
        },
      },
    },

    MuiButtonBase: {
      styleOverrides: {
        root: {
          "&.MuiPickersDay-root": {
            color: "var(--secondary)",

            "&.Mui-disabled:not(.Mui-selected)": {
              color: "var(--secondary-400)",
            },
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "12px",
        },
      },
      defaultProps: {
        disableInteractive: true,
        PopperProps: {
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, -14],
              },
            },
          ],
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 60,
          height: 60,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid",
          borderColor: "var(--secondary-300)",
          backgroundColor: "transparent",
          paddingLeft: "24px",
          paddingTop: "8px",
          paddingBottom: "8px",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "6px",
          fontWeight: 500,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: "14px",
          minHeight: "44px",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid var(--border-subtle)",
          padding: "12px 16px",
        },
        head: {
          fontWeight: 600,
          color: "var(--text-muted)",
          backgroundColor: "var(--surface-muted)",
        },
      },
    },
  },
});

export default responsiveFontSizes(theme);
