import type { ChangeEvent } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";

export type CustomCheckboxProps<T extends FieldValues> = {
  handleChange?: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  name: Path<T>;
  control: Control<T>;
  options: { label: string; value: string; disabled?: boolean;}[];
  rules?: Record<string, string[]>;
  identifier: string;
  inputPropsClassName?: string,
  showError?: boolean,
  row?:boolean,
  optionGap?: number
};
