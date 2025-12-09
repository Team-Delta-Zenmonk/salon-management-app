export const getSnackBarStyles = (state: string) => {
  const getVariantStyle = () => {
    switch (state) {
      case "error":
        return {
          backgroundColor: "var(--error-50)",
          color: "var(--error-600)",
        };
      case "success":
        return {
          backgroundColor: "var(--success-50)",
          color: "var(--success-700)",
        };
      case "warning":
        return {
          backgroundColor: "var(--warning-50)",
          color: "var(--warning-700)",
        };
      case "info":
        return {
          backgroundColor: "var(--info-50)",
          color: "var(--success-700)",
        };
      default:
        return {
          backgroundColor: "#F7F9FC",
          color: "var(--secondary-800)",
        };
    }
  };
  return {
    boxShadow: "0px 2px 8px 3px rgba(51, 51, 51, 0.15)",
    borderRadius: "8px",
    ...getVariantStyle(),
  };
};
