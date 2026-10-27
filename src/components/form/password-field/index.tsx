import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import TextField from "../textfield/index";
import clsx from "clsx";

type PasswordFieldProps = {
  label: string;
  name: string;
  control: any;
  identifier: string;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  inputPropsClassName?: string;
};

const PasswordField = ({
  label,
  name,
  control,
  identifier,
  disabled,
  placeholder,
  maxLength,
  inputPropsClassName,
}: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <TextField
      type={showPassword ? "text" : "password"}
      label={label}
      name={name}
      control={control}
      identifier={identifier}
      disabled={disabled}
      placeholder={placeholder}
      endAdornment={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      onEndAdornmentClick={toggleShowPassword}
      highlightPrimaryIconButton
      maxLength={maxLength}
      inputPropsClassName={clsx(
        "bg-white dark:bg-neutral-900 placeholder:text-muted-foreground/60 placeholder:tracking-widest",
        inputPropsClassName
      )}
    />
  );
};

export default PasswordField;
