import type { Control, FieldValues, Path, RegisterOptions } from "react-hook-form";
import type { Dayjs } from "dayjs";

export type CustomDateTimePickerProps<T extends FieldValues> = {
  placeholder: string;
  name: Path<T>;
  control: Control<T>;
  identifier: string;
  disabled?: boolean;
  minDateTime?: Dayjs | null;
  maxDateTime?: Dayjs | null;
  valueFormat?: "iso";
  handleChange?: () => void;
  label?: string;
  triggerClassName?: string;
  rules?: Omit<RegisterOptions<T, Path<T>>, "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled">;
  helperText?: string;
  intervalMinutes?: number;
  isManual?: boolean;
};
