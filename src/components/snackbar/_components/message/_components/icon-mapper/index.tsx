import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ReportGmailerrorredOutlinedIcon from "@mui/icons-material/ReportGmailerrorredOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { type VariantType } from "notistack";

interface IconMapperProps {
  variant: VariantType | undefined;
}

export const IconMapper = ({ variant }: IconMapperProps) => {
  switch (variant) {
    case "success":
      return <CheckCircleOutlinedIcon className="text-(--success-700)!" />;
    case "error":
      return <RemoveCircleOutlineIcon className="text-(--error-600)!" />;
    case "warning":
      return <ReportGmailerrorredOutlinedIcon className="text-(--warning-700!"/>;
    case "info":
      return <InfoOutlinedIcon className="text(--info-700!)!" />;
    default:
      return null;
  }
};
