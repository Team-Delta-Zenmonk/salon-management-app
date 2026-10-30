import { ChevronUp, ChevronDown } from "lucide-react";
import clsx from "clsx";

import type { FieldError, FieldValues, Path, PathValue } from "react-hook-form";

type ArrowButtonsProps<T extends FieldValues> = {
  endAdornmentClassName?: string;
  onChange: (...event: any[]) => void;
  value: PathValue<T, Path<T>>;
  error: FieldError | undefined;
  identifier: string;
  min?: number;
  max?: number;
  disabled?: boolean;
};

function ArrowButtons<T extends FieldValues>({
  endAdornmentClassName,
  onChange,
  value,
  error,
  identifier,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  disabled = false,
}: Readonly<ArrowButtonsProps<T>>)  {
  const handleUp = () => {
    if (disabled) return;
    const numericValue = Number(value) || 0;
    const newValue = numericValue < max ? numericValue + 1 : max;
    onChange(String(newValue));
  };

  const handleDown = () => {
    if (disabled) return;
    const numericValue = Number(value) || 0;
    const newValue = numericValue > min ? numericValue - 1 : min;
    onChange(String(newValue));
  };

  return (
    <div
      className={clsx(
        "flex flex-col justify-center pl-2",
        disabled && "opacity-50 pointer-events-none cursor-not-allowed",
        endAdornmentClassName,
        error && "text-destructive"
      )}
    >
      <button
        type="button"
        className={clsx("p-0 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors")}
        onClick={handleUp}
        disabled={disabled || Number(value) >= max}
        data-test-id={`btn-number-input-arrow-up-${identifier}`}
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={clsx("p-0 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors")}
        onClick={handleDown}
        disabled={disabled || Number(value) <= min}
        data-test-id={`btn-number-input-arrow-down-${identifier}`}
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}

export default ArrowButtons;
