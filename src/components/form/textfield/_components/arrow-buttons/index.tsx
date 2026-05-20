import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import styles from "./arrow-buttons.module.scss";
import clsx from "clsx";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";

import type { FieldError, FieldValues, Path, PathValue } from "react-hook-form";

type ArrowButtonsProps<T extends FieldValues> = {
  endAdornmentClassName?: string;
  onChange: (...event: any[]) => void;
  value: PathValue<T, Path<T>>;
  error: FieldError | undefined;
  identifier: string;
  min?: number;
  max?: number;
};

function ArrowButtons<T extends FieldValues>({
  endAdornmentClassName,
  onChange,
  value,
  error,
  identifier,
  min = 0,
  max = 50000,
}: Readonly<ArrowButtonsProps<T>>)  {
  const handleUp = () => {
    const numericValue = Number(value) || 0;
    const newValue = numericValue < max ? numericValue + 1 : max;
    onChange(String(newValue));
  };

  const handleDown = () => {
    const numericValue = Number(value) || 0;
    const newValue = numericValue > min ? numericValue - 1 : min;
    onChange(String(newValue));
  };

  return (
    <InputAdornment
      className={endAdornmentClassName && clsx(error ? styles.endAdornmentError : styles[endAdornmentClassName])}
      position="end"
    >
      <Stack>
        <IconButton
          className={clsx("p-0", styles.arrowBtn)}
          onClick={handleUp}
          disabled={Number(value) >= max}
          data-test-id={`btn-number-input-arrow-up-${identifier}`}
        >
          <ArrowDropUpIcon className="iconSizeStyles" />
        </IconButton>
        <IconButton
          className={clsx("p-0", styles.arrowBtn)}
          onClick={handleDown}
          disabled={Number(value) <= min}
          data-test-id={`btn-number-input-arrow-down-${identifier}`}
        >
          <ArrowDropDownIcon className="iconSizeStyles" />
        </IconButton>
      </Stack>
    </InputAdornment>
  );
}

export default ArrowButtons;
