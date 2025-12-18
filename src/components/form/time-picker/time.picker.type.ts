import type { Control, FieldValues, Path } from "react-hook-form";
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
};
