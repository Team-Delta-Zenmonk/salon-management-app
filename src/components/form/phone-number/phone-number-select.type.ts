import { Country } from "locations-js/dist/Domain";
import type { Control, FieldValues, Path } from "react-hook-form";

export type PhoneNumberSelectProps<T extends FieldValues> = {
  placeholder: string;
  name: Path<T>;
  options: Array<Country>;
  control: Control<T>;
  identifier: string;
  loading?: boolean;
  labelField?: string;
  index?: number;
  disabled?: boolean;
};
