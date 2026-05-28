import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { ForgotPasswordSchema, type ForgotPasswordForm } from "./schema/forgot-password.schema";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import TextField from "../../components/form/textfield";
import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../features/auth/forgot-password/forgot-password.service";
import { callSnack } from "../../components/snackbar";

export default function ForgotPassword() {
  const methods = useForm<ForgotPasswordForm>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const { handleSubmit, control } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);
      await forgotPassword(data.email);
      callSnack("Reset link sent to your email", "success");
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message || err?.response?.data || "";

      if (backendMessage.includes("Salon not found")) {
        methods.setError("email", { type: "manual", message: "Email not registered. Please Login." });
      } else {
        callSnack("Internal server error", "error");
      }
    } finally {
      setIsLoading(false);
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex items-center justify-center min-h-screen p-4">
        <Box className="w-full max-w-md p-6 flex flex-col gap-6 rounded-xl border border-[#e5e5e5]">
          <Box className="flex flex-col items-center mb-8">
            <Box className="w-16 h-16 bg-(--primary-900) rounded-lg flex items-center justify-center mb-4">
              <ContentCutIcon className="text-white!" />
            </Box>
            <Box>Forgot Password</Box>
            <Box className="text-(--primary-900)">Enter your email to reset your password</Box>
          </Box>
          <Box className="space-y-6">
            <Box className="space-y-3">
              <Box className=" flex flex-col gap-2">
                <Typography>Email Address</Typography>
                <TextField
                  type="text"
                  label="Email"
                  name="email"
                  control={control}
                  identifier="forgot-password-email"
                  disabled={isLoading}
                />
              </Box>
            </Box>
            <Box className="w-full flex items-center justify-center">
              <Button variant="contained" disabled={isLoading} fullWidth type="submit" startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : undefined}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </Box>
            <Box className="flex justify-center items-center">
              <Box className="flex flex-row gap-1 text-gray-600">
                Remember Password ?
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
