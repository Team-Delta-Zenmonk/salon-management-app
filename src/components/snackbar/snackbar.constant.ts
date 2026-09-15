export const getSnackBarStyles = (state: string) => {
  const getVariantStyle = () => {
    switch (state) {
      case "error":
        return {
          backgroundColor: "var(--destructive)",
          color: "var(--destructive-foreground)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        };
      case "success":
        return {
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        };
      case "warning":
        return {
          backgroundColor: "#f59e0b",
          color: "#ffffff",
          border: "1px solid #d97706",
        };
      case "info":
      default:
        return {
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        };
    }
  };
  return {
    boxShadow: "0 20px 30px -10px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.08)",
    borderRadius: "14px",
    padding: "10px 18px",
    fontWeight: "600",
    letterSpacing: "-0.01em",
    ...getVariantStyle(),
  };
};
