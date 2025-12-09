import { CssBaseline, StyledEngineProvider, ThemeProvider } from "@mui/material";

import theme from "./theme";

export default function ThemeProviderWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
      <StyledEngineProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </StyledEngineProvider>
  );
}