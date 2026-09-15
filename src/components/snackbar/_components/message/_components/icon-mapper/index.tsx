import { CheckCircle2, AlertOctagon, AlertTriangle, Info } from "lucide-react";
import { type VariantType } from "notistack";

interface IconMapperProps {
  variant: VariantType | undefined;
}

export const IconMapper = ({ variant }: IconMapperProps) => {
  switch (variant) {
    case "success":
      return <CheckCircle2 className="h-5 w-5 shrink-0 text-current" />;
    case "error":
      return <AlertOctagon className="h-5 w-5 shrink-0 text-current" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 shrink-0 text-current" />;
    case "info":
      return <Info className="h-5 w-5 shrink-0 text-current" />;
    default:
      return null;
  }
};
