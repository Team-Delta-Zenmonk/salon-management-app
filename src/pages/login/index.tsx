import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { LoginSchema, type LoginForm } from "./schema/login.schema";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import TextField from "../../components/form/textfield";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordField from "../../components/form/password-field";
import { loginSalonAction } from "../../features/auth/login/login.action";
import { useAppDispatch } from "../../store/hooks";
import { callSnack } from "../../components/snackbar";
import { VALIDATE_PATTERN } from "../../common/validate-pattern";

export default function Login() {
  const methods = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
  });

  const { handleSubmit, control } = methods;
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);
      const result = await dispatch(loginSalonAction({ email: data.email, password: data.password })).unwrap();
      callSnack("Welcome to salon dashboard", "success");
       if (result?.salon?.is_onboarded) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/salon-onboarding", { replace: true });
      }
    } catch (err: any) {
      const code = err?.code;

      if (code === "SALON_NOT_FOUND") {
        callSnack("Salon not registered", "error");
      } else if (code === "INVALID_PASSWORD") {
        methods.setError("password", { type: "manual", message: "Invalid password" });
      } else {
        callSnack("Internal server error", "error");
      }
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex items-center justify-center min-h-screen p-4">
        <Box className="w-full max-w-md p-6 flex flex-col gap-6 rounded-xl border border-[#e5e5e5]">
          <Box className="flex flex-col items-center mb-8">
            <Box className="w-16 h-16 bg-(--primary-900) rounded-lg flex items-center justify-center mb-4">
              <ContentCutIcon className="text-white!" />
            </Box>
            <Box data-test-id="text-login-form-title">Login to Your Salon</Box>
            <Box className="text-(--primary-900)">Manage your salon business</Box>
          </Box>
          <Box className="space-y-6">
            <Box className="space-y-3">
              <Box className="flex flex-col gap-2">
                <Typography data-test-id="login-form-email-label">Email</Typography>
                <TextField
                  type="text"
                  label="Email"
                  name="email"
                  control={control}
                  identifier="login-form-email"
                  disabled={isLoading}
                  pattern={VALIDATE_PATTERN.noSpace}
                />
              </Box>
              <Box className="flex flex-col gap-2">
                <Typography data-test-id="login-form-password-label">Password</Typography>
                <PasswordField
                  label="Password"
                  name="password"
                  control={control}
                  identifier="login-form-password"
                  disabled={isLoading}
                />
              </Box>
              <Box className="text-(--primary-900) hover:text-blue-900 flex items-end justify-end">
                <Link to="/forgot-password">Forget Password ?</Link>
              </Box>
            </Box>
            <Box className="w-full flex items-center justify-center">
              <Button variant="contained" disabled={isLoading} fullWidth type="submit" startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : undefined}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </Box>
            <Box className="flex justify-center items-center">
              <Box className="flex flex-row gap-1 text-gray-600">
                Don't have an account ?
                <Typography className="text-(--primary-900) hover:text-blue-900">
                  <Link to="/signup">Create Salon Account</Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </form>
    </FormProvider>
  );
}
