import type { Control, FieldValues, Path } from "react-hook-form";

export interface CheckboxTreeNode {
  label: string;
  value: string;
  disabled?: boolean;
  children?: CheckboxTreeNode[];
}

export type CustomCheckboxTreeProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  options: CheckboxTreeNode[];
  rules?: Record<string, string[]>;
  identifier: string;
  showError?: boolean;
};
