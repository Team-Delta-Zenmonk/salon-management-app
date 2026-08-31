import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { type VariantType } from "notistack";

interface IconMapperProps {
  variant: VariantType | undefined;
}

export const IconMapper = ({ variant }: IconMapperProps) => {
  switch (variant) {
    case "success":
      return <CheckCircle className="text-(--success-700)!" />;
    case "error":
      return <XCircle className="text-(--error-600)!" />;
    case "warning":
      return <AlertTriangle className="text-(--warning-700)!" />;
    case "info":
      return <Info className="text-(--info-700)!" />;
    default:
      return null;
  }
};
