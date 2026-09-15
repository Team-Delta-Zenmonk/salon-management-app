"use client";
import { SnackbarProvider } from "notistack";

const SnackbarProviderWrapper = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <SnackbarProvider 
      maxSnack={3} 
      hideIconVariant 
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      {children}
    </SnackbarProvider>
  );
};

export default SnackbarProviderWrapper;
