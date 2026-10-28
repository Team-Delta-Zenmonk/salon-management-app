import type { Control, FieldValues, Path } from "react-hook-form";
import type { ReactNode } from "react";

export type SelectOption = {
  value: string;
  label: string | number;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "outline" | "destructive";
  subtitle?: string;
  isSubItem?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  trailingElement?: ReactNode;
};

export type CustomSelectProps<T extends FieldValues> = {
  placeholder: string;
  name: Path<T>;
  options?: Array<SelectOption | { value: string; label: string | number }>;
  control: Control<T>;
  identifier: string;
  label?: string;
  translate?: boolean;
  disabled?: boolean;
  rules?: any;
  triggerClassName?: string;
  onChange?: (value: string | null) => void;
  onOpenChange?: (open: boolean) => void;
  onScrollEnd?: () => void;
  isLoadingMore?: boolean;
  renderOption?: (option: any) => ReactNode;
};
