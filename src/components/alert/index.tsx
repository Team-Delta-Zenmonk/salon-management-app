import React from "react";
import { Box, Typography } from "@mui/material";

type AlertVariant = "success" | "error" | "warning" | "info" | "neutral";

interface AlertProps {
  variant: AlertVariant;
  icon?: React.ReactNode;
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function Alert({ variant, icon, title, children, action }: AlertProps) {
  const getStyles = () => {
    switch (variant) {
      case "error":
        return "bg-[var(--error-50)] border-[var(--error-200)] text-[var(--error-800)]";
      case "success":
        return "bg-[var(--success-50)] border-[var(--success-200)] text-[var(--success-800)]";
      case "warning":
        return "bg-[var(--warning-50)] border-[var(--warning-200)] text-[var(--warning-800)]";
      case "neutral":
        return "bg-[var(--surface)] border-[var(--border-subtle)] text-[var(--text-primary)]";
      case "info":
      default:
        return "bg-[var(--info-50)] border-[var(--info-200)] text-[var(--info-800)]";
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case "error":
        return "text-[var(--error-600)]";
      case "success":
        return "text-[var(--success-600)]";
      case "warning":
        return "text-[var(--warning-600)]";
      case "neutral":
        return "text-[var(--text-muted)]";
      case "info":
      default:
        return "text-[var(--info-600)]";
    }
  };

  return (
    <Box
      className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl border shadow-sm ${getStyles()}`}
    >
      <Box className="flex items-start md:items-center gap-3 w-full">
        {icon && <Box className={`flex-shrink-0 mt-1 md:mt-0 ${getIconStyles()}`}>{icon}</Box>}
        <Box className="flex flex-col w-full">
          {title && <Typography className="font-semibold text-base mb-0.5">{title}</Typography>}
          <Typography className="text-sm opacity-90 leading-relaxed">{children}</Typography>
        </Box>
      </Box>
      {action && <Box className="flex-shrink-0 self-end md:self-auto w-full md:w-auto mt-2 md:mt-0">{action}</Box>}
    </Box>
  );
}
