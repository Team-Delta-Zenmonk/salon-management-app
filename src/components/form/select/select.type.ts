import type { Control, FieldValues, Path } from "react-hook-form";

export type CustomSelectProps<T extends FieldValues> = {
  placeholder: string;
  name: Path<T>;
  options?: Array<{ value: string; label: string | number }>;
  control: Control<T>;
  identifier: string;
  translate?: boolean;
  disabled?: boolean;
  rules?: any;
};
