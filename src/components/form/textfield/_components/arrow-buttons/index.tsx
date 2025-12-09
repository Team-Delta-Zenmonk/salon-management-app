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
};

function ArrowButtons<T extends FieldValues>({
  endAdornmentClassName,
  onChange,
  value,
  error,
  identifier,
}: Readonly<ArrowButtonsProps<T>>)  {
  const handleUp = () => {
    const newValue = value ? Math.min(99, Number(value) + 1) : 1;
    onChange(String(newValue));
  };

  const handleDown = () => {
    const newValue = value && Number(value) > 1 ? Number(value) - 1 : 1;
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
          data-test-id={`btn-number-input-arrow-up-${identifier}`}
        >
          <ArrowDropUpIcon className="iconSizeStyles" />
        </IconButton>
        <IconButton
          className={clsx("p-0", styles.arrowBtn)}
          onClick={handleDown}
          data-test-id={`btn-number-input-arrow-down-${identifier}`}
        >
          <ArrowDropDownIcon className="iconSizeStyles" />
        </IconButton>
      </Stack>
    </InputAdornment>
  );
}

export default ArrowButtons;
