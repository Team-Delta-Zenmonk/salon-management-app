import { Typography } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import MuiSelect from "@mui/material/Select";
import clsx from "clsx";
import { Controller, type FieldValues } from "react-hook-form";
import styles from "./select.module.scss";
import type { CustomSelectProps } from "./select.type";

const Select = <T extends FieldValues>({
  placeholder,
  name,
  options,
  control,
  identifier,
  translate = true,
  disabled = false,
}: CustomSelectProps<T>) => {
  
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => {
        return (
          <FormControl fullWidth error={!!error?.type}>
            <InputLabel
              id={name}
              data-test-id={`label-${identifier}`}
              classes={{ root: clsx(styles.label, { [styles.disabledLabel]: disabled }), shrink: styles.shrunkLabel }}
            >
              {placeholder}
            </InputLabel>
            <MuiSelect
              disabled={disabled}
              onChange={onChange}
              value={value ?? ""}
              inputRef={ref}
              name={name}
              label={placeholder}
              labelId={name}
              error={!!error?.type}
              onBlur={onBlur}
              MenuProps={{ sx: { maxHeight: "40vh" }, PaperProps: { className: styles.menuPaper }}}
              inputProps={{
                className: styles.input,
                "data-test-id": `input-select-${identifier}`,
              }}
              classes={{
                root: styles.selectRoot,
                select: styles.selectInput,
              }}
              SelectDisplayProps={{
                ...({ "data-test-id": `select-display-${identifier}` } as any),
              }}
              data-test-id={`select-${identifier}`}
            >
              {options && options?.length > 0 ? (
                options?.map((option) => {
                  return (
                    <MenuItem
                      sx={{ minHeight: "auto" }}
                      value={option.value}
                      key={option.label}
                      data-test-id={`li-${identifier}-${option.label}`}
                    >
                      <Typography variant="paragraphMd" color="secondary" className={styles.menuItem}>
                        {translate ? option.label : option.label}
                      </Typography>
                    </MenuItem>
                  );
                })
              ) : (
                <MenuItem value={""} data-test-id={`li-${identifier}-no-options`}>
                  No options
                </MenuItem>
              )}
            </MuiSelect>
            {error && (
              <FormHelperText data-test-id={`text-error-${identifier}`}>{error?.message}</FormHelperText>
            )}
          </FormControl>
        );
      }}
    />
  );
};

export default Select;
