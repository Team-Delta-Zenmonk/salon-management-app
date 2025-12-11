import type { Control, FieldValues, Path } from "react-hook-form";
import type { CloudinaryFile } from "../../../common/cloudinary.schema";

export type FilePickerProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  control: Control<T>;
  identifier: string;
  disabled?: boolean;
  accept?: string;
  maxSizeBytes?: number;
  uploadFn: (file: File) => Promise<CloudinaryFile>;
};
