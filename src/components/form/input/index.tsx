import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import type { InputComponentProps } from "./input-tye";


export const InputComponent = (props: InputComponentProps) => {
  const {
    error,
    onChange,
    startAdornment,
    endAdornment,
    className,
    placeholder,
    helperText,
    label,
    type,
    identifier,
    maxLength,
    multiline,
    rows,
    value,
    disabled
  } = props;

  return (
    <FormControl className={`form-control-${className ?? ""}`} fullWidth={true}>
      <TextField
        label={label}
        placeholder={placeholder}
        className={className}
        error={!!error}
        helperText={error ? helperText : ""}
        type={type}
        value={value}
        autoComplete="off"
        multiline={multiline}
        rows={rows}
        slotProps={{
          htmlInput: {
            maxLength: maxLength,
            className: multiline ? "" : "pt-2 pb-2",
            "data-test-id": `input-${identifier}`,
            sx: {
              height: "auto",
              boxSizing: 'border-box',
              "&::placeholder": {
                color: error ? "var(--error)" : "var(--secondary-600)",
                opacity: 1,
              },
            },
          },
          input: {
            ...(startAdornment || endAdornment
              ? {
                  startAdornment: startAdornment && <InputAdornment position="start">{startAdornment}</InputAdornment>,
                  endAdornment: endAdornment && <InputAdornment position="end">{endAdornment}</InputAdornment>,
                }
              : {}),
          },
          formHelperText: {
            ...({ "data-test-id": `text-error-${identifier}` } as any),
          },
        }}
        data-test-id={`textfield-${identifier}`}
        onChange={(e) => {
          const cleanedValue = e.target.value
            .split("\n")
            .reduce((acc, line, index) => {
              if (line.trim() === "" && (index === 0 || acc[acc.length - 1] === "")) {
                return acc;
              }
              acc.push(line.replace(/^\s+/, ""));
              return acc;
            }, [] as string[])
            .join("\n")
            .replace(/[ \t]{2,}/g, " ");
          if (cleanedValue === value) return;
          onChange(cleanedValue);
        }}
        disabled={disabled}
      />
    </FormControl>
  );
};