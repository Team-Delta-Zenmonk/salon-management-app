import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { FormControlLabel, FormGroup, FormHelperText, Checkbox as MuiCheckbox } from "@mui/material";
import clsx from "clsx";
import { Controller, type FieldValues } from "react-hook-form";
import styles from "./checkbox.module.scss";
import type { CustomCheckboxProps } from "./checkbox.type";

const CheckboxGroup = <T extends FieldValues>({
  name,
  control,
  rules,
  identifier,
  inputPropsClassName = "",
  showError = true,
  options,
  row,
  optionGap,
}: CustomCheckboxProps<T>) => {
  const handleChange = (e: any, onChange: (event: any[]) => void, storedValue: string[] | undefined) => {
    if (storedValue?.includes(e.target.value)) {
      onChange(storedValue.filter((val: string) => val !== e.target.value));
    } else if (storedValue) {
      onChange([...storedValue, e.target.value]);
    } else {
      onChange([e.target.value]);
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value: storedValue, onBlur, ref, ...others }, fieldState: { error } }) => {
        return (
          <FormGroup
            row={row ?? undefined}
            style={{ gap: optionGap ?? 1 }}
            onChange={(e) => handleChange(e, onChange, storedValue)}
          >
            {options.map(({ label, value, disabled }) => (
              <FormControlLabel
                key={`${label} ${value}`}
                label={label.replace(/\b\w/g, (c) => c.toUpperCase())}
                className={styles.checkboxControlLabel}
                classes={{ label: styles.checkboxLabel }}
                control={
                  <MuiCheckbox
                    onBlur={onBlur}
                    value={value}
                    checked={storedValue?.includes(value) ?? false}
                    disabled={disabled}
                    data-test-id={identifier}
                    className={clsx(styles.checkbox, inputPropsClassName)}
                    slotProps={{ input: { ref } }}
                    {...others}
                    checkedIcon={<CheckBox data-test-id={`${value}_checked-icon`} />}
                    icon={<CheckBoxOutlineBlank data-test-id={`${value}_unchecked-icon`} />}
                  />
                }
              />
            ))}
            {showError && error?.message && (
              <FormHelperText error data-test-id={`checkbox-error-${identifier}`} className="mt-0 w-100">
                {error.message}
              </FormHelperText>
            )}
          </FormGroup>
        );
      }}
    />
  );
};

export default CheckboxGroup;
