"use client";
import { SnackbarProvider } from "notistack";

const SnackbarProviderWrapper = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <SnackbarProvider maxSnack={2} hideIconVariant>
      {children}
    </SnackbarProvider>
  );
};

export default SnackbarProviderWrapper;
