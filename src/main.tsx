import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import App from "./app.tsx";
import { Provider } from "react-redux";
import { persistor, store } from "./store/store.ts";
import { PersistGate } from "redux-persist/integration/react";
import ThemeProviderWrapper from "./theme/theme-provider.tsx";
import SnackbarProviderWrapper from "./components/snackbar/_components/snackbar-provider/index.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProviderWrapper>
        <SnackbarProviderWrapper>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <App />
            </PersistGate>
          </Provider>
        </SnackbarProviderWrapper>
      </ThemeProviderWrapper>
    </BrowserRouter>
  </StrictMode>
);
