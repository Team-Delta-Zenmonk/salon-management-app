import { type ReactNode } from "react";

export type InputComponentProps = {
  onChange: (value: string) => void;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  className?: string;
  helperText?: string;
  placeholder?: string;
  identifier: string;
  maxLength?: number;
  type?: string;
  label?: string;
  error?: boolean;
  multiline?: boolean; 
  rows?: number; 
  value?: string;
  height?: number;
  disabled?: boolean;
};
