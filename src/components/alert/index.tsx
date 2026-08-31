import React from "react";

type AlertVariant = "success" | "error" | "warning" | "info";

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
        return "bg-red-50 border-red-200 text-red-800";
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "info":
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case "error":
        return "text-red-600";
      case "success":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "info":
      default:
        return "text-blue-600";
    }
  };

  return (
    <div
      className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl border shadow-sm ${getStyles()}`}
    >
      <div className="flex items-start md:items-center gap-3 w-full">
        {icon && <div className={`flex-shrink-0 mt-1 md:mt-0 ${getIconStyles()}`}>{icon}</div>}
        <div className="flex flex-col w-full">
          {title && <span className="font-semibold text-base mb-0.5">{title}</span>}
          <p className="text-sm opacity-90 leading-relaxed m-0">{children}</p>
        </div>
      </div>
      {action && <div className="flex-shrink-0 self-end md:self-auto w-full md:w-auto mt-2 md:mt-0">{action}</div>}
    </div>
  );
}
