import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordSchema, type ResetPasswordForm } from "./schema/reset-password.schema";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PasswordField from "../../components/form/password-field";
import { resetPassword } from "../../features/auth/reset-password/reset-password.service";
import { callSnack } from "../../components/snackbar";

export default function ResetPassword() {
  const methods = useForm<ResetPasswordForm>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const { handleSubmit, control } = methods;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);

      await resetPassword(token!, data.password);
      callSnack("Password reset successfully", "success");
      navigate("/login");
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message || err?.response?.data || "";

      if (backendMessage.includes("Invalid token")) {
        callSnack("Invalid token", "error");
      } else if (backendMessage.includes("Token expired")) {
        callSnack("Token expired", "error");
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
        <Box className="w-full max-w-md p-8 flex flex-col gap-6 rounded-xl border border-[#e5e5e5]">
          <Box className="flex flex-col items-center mb-8">
            <Box className="w-16 h-16 bg-(--primary-900) rounded-lg flex items-center justify-center mb-4">
              <ContentCutIcon className="text-white!" />
            </Box>
            <Box>Reset Password</Box>
            <Box className="text-(--primary-900)">Create a new strong password for your account</Box>
          </Box>
          <Box className="space-y-6">
            <Box className="space-y-3">
              <Box className="flex flex-col gap-2">
                <Typography>New Password</Typography>
                <PasswordField
                  label="Password"
                  name="password"
                  control={control}
                  identifier="reset-password"
                  disabled={isLoading}
                />
              </Box>
              <Box className="flex flex-col gap-2">
                <Typography>Confirm New Password</Typography>
                <PasswordField
                  label="Confirm Password"
                  name="confirm_password"
                  control={control}
                  identifier="reset-confirm-password"
                  disabled={isLoading}
                />
              </Box>
            </Box>
            <Box className="w-full flex items-center justify-center">
              <Button variant="contained" disabled={isLoading} fullWidth type="submit" startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : undefined}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </Box>
            <Box className="flex justify-center items-center">
              <Box className="flex flex-row gap-1 text-gray-600">
                Remember your password ?
                <Typography className=" text-(--primary-900) hover:text-blue-900">
                  <Link to="/login">Login</Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </form>
    </FormProvider>
  );
}
