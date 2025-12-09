import { useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import TextField from "../textfield/index"

type PasswordFieldProps = {
  label: string;
  name: string;
  control: any;
  identifier: string;
  disabled?: boolean;
};

const PasswordField = ({ label, name, control, identifier, disabled }: PasswordFieldProps) => {
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
      endAdornment={showPassword ? <VisibilityOff /> : <Visibility />}
      onEndAdornmentClick={toggleShowPassword}
      highlightPrimaryIconButton
    />
  );
};

export default PasswordField;
