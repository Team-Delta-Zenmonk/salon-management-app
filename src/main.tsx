import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./utils/leaflet-icon-fix";
import { BrowserRouter } from "react-router-dom";
import App from "./app.tsx";
import { Provider } from "react-redux";
import { persistor, store } from "./store/store.ts";
import { PersistGate } from "redux-persist/integration/react";
import SnackbarProviderWrapper from "./components/snackbar/_components/snackbar-provider/index.tsx";
import { ColorThemeProvider } from "./providers/color-theme-provider.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ColorThemeProvider>
          <SnackbarProviderWrapper>
            <Provider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <App />
              </PersistGate>
            </Provider>
          </SnackbarProviderWrapper>
        </ColorThemeProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
