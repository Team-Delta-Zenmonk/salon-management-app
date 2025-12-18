import type { Control, FieldValues, Path } from "react-hook-form";
import type { Dayjs } from "dayjs";

export type CalendarViewOptions = "year" | "month" | "day";

export type CustomDatePickerProps<T extends FieldValues> = {
  placeholder: string;
  name: Path<T>;
  control: Control<T>;
  identifier: string;
  views?: CalendarViewOptions[];
  format?: string;
  disableFuture?: boolean;
  disablePast?: boolean;
  disabled?: boolean;
  minDate?: Dayjs | null;
  handleChange?: () => void;
};
