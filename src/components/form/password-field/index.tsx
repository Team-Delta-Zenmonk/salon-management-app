import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import TextField from "../textfield/index";

type PasswordFieldProps = {
  label: string;
  name: string;
  control: any;
  identifier: string;
  disabled?: boolean;
  placeholder?: string;
};

const PasswordField = ({ label, name, control, identifier, disabled, placeholder }: PasswordFieldProps) => {
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
    />
  );
};

export default PasswordField;
