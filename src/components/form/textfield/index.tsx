import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MuiTextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import clsx from "clsx";
import { Controller, type FieldValues } from "react-hook-form";
import ArrowButtons from "./_components/arrow-buttons";
import styles from "./textfield.module.scss";
import { type CustomTextFieldProps } from "./textfield.type";

const TextField = <T extends FieldValues>({
  type,
  placeholder,
  name,
  control,
  handleChange,
  pattern,
  label,
  startAdornment,
  endAdornment,
  handleBlur,
  disabled,
  maxLength,
  rules,
  identifier,
  endAdornmentClassName,
  endAdornmentToolTipText,
  onEndAdornmentClick,
  inputPropsClassName = "a",
  showError = true,
  highlightPrimaryIconButton = false,
  processChange,
  extraSpacesNotAllowed = true,
  min,
  max,
  multiline,
  rows,
}: CustomTextFieldProps<T>) => {

  const handleNumberChange = (evt: React.KeyboardEvent<HTMLDivElement>) => {
    !/\d/.test(evt.key) &&
      evt.key !== "Backspace" &&
      evt.key !== "Delete" &&
      evt.key !== "ArrowLeft" &&
      evt.key !== "ArrowRight" &&
      evt.key !== "ArrowUp" &&
      evt.key !== "ArrowDown" &&
      evt.key !== "Tab" &&
      evt.preventDefault();
  };

  const handleInput = (e: any) => {
    if (extraSpacesNotAllowed) {
      const input = e.target;
      const cleaned = input.value.replace(/^\s+/, "").replaceAll(/\s{2,}/g, " ");
      if (input.value !== cleaned) {
        const diff = input.value.length - cleaned.length;
        const caretPos = Math.max(input.selectionStart - diff, 0);

        input.value = cleaned;
        input.setSelectionRange(caretPos, caretPos);
      }
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value, onBlur, ref, ...others }, fieldState: { error } }) => (
        <MuiTextField
          fullWidth
          disabled={disabled}
          error={Boolean(error) && showError}
          placeholder={placeholder}
          helperText={error && showError ? error?.message : ""}
          autoComplete="off"
          label={label}
          type={type}
          inputRef={ref}
          onKeyDown={(evt) => type === "number" && handleNumberChange(evt)}
          onBeforeInput={(e) => {
            const input = e.target as HTMLInputElement;
            const { selectionStart, selectionEnd, value } = input;
            const newValue = value.slice(0, selectionStart!) + (e.data ?? "") + value.slice(selectionEnd!);
            if (extraSpacesNotAllowed && (!value?.trim() && !newValue.trim()) || value.replaceAll(/\s+/g, " ") === newValue.replaceAll(/\s+/g, " ")) {
              e.preventDefault();
              return;
            }
            if (pattern && !pattern.test(newValue)) {
              e.preventDefault();
            }
          }}
          onInput={handleInput}
          slotProps={{
            htmlInput: {
              "data-test-id": `input-${identifier}`,
              maxLength: maxLength,
              min: min,
              max: max,
              className: startAdornment ? styles.inputWithStartAdornment : styles.input,
            },
            input: {
              classes: { input: error && showError ? styles.errorPlaceholder : styles.placeholder },
              className: clsx(styles.textfieldInput, inputPropsClassName),
              startAdornment: startAdornment ?? null,
              endAdornment:
                type === "number" ? (
                  <ArrowButtons
                    endAdornmentClassName={endAdornmentClassName}
                    onChange={onChange}
                    value={value}
                    error={error}
                    identifier={identifier}
                    min={min}
                    max={max}
                  />
                ) : (
                  endAdornment && (
                    <InputAdornment
                      className={
                        endAdornmentClassName &&
                        clsx(error && showError ? styles.endAdornmentError : styles[endAdornmentClassName])
                      }
                      position="end"
                    >
                      <Tooltip
                        disableInteractive
                        title={endAdornmentToolTipText}
                        slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: "offset",
                                options: {
                                  offset: [0, -14],
                                },
                              },
                            ],
                          },
                        }}
                        data-test-id={`tooltip-end-adornment-${identifier}`}
                      >
                        <IconButton
                          disableTouchRipple
                          disableFocusRipple
                          disableRipple
                          data-test-id={`btn-end-adornment-${identifier}`}
                          edge={"end"}
                          onClick={() => onEndAdornmentClick?.(value!)}
                          disabled={disabled}
                          className={clsx(
                            { errorText: error && showError },
                            { [styles.highlightPrimaryIconButton]: highlightPrimaryIconButton }
                          )}
                          classes={{
                            disabled: styles.disabledIconButton,
                          }}
                        >
                          {endAdornment}
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                ),
            },
            formHelperText: {
              ...({ "data-test-id": `text-error-${identifier}` } as any),
            },
            inputLabel: {
              ...({ "data-test-id": `label-${identifier}` } as any),
              classes: {
                root: styles.label,
                shrink: styles.shrunkLabel,
                disabled: styles.disabledLabel,
              },
            },
          }}
          value={value ?? ""}
          onBlur={handleBlur ?? onBlur}
          multiline={multiline}
          rows={rows}
          {...others}
          onChange={(e) => {
            const newValue = e.target.value;
            if (handleChange) {
              return handleChange(e);
            }
            if (!pattern || pattern?.test(newValue)) {
              onChange(processChange ? processChange(newValue) : newValue);
            }
          }}
          className={clsx(styles.textfield, { [styles.textfieldWithEndAdornment]: !!endAdornment })}
          data-test-id={`textfield-${identifier}`}
        />
      )}
    />
  );
};

export default TextField;
