import type { Control, FieldValues, Path } from "react-hook-form";

export interface OTPInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  length?: number;
  disabled?: boolean;
  identifier?: string;
}