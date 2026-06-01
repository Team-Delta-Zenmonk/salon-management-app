import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpSchema, type SignUpForm } from "./schema/signup.schema";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import TextField from "../../components/form/textfield";
import { useState } from "react";
import PasswordField from "../../components/form/password-field";
import { registerSalon } from "../../features/salon-onboarding/register-salon/register-salon.service";
import { useNavigate, Link } from "react-router-dom";
import { callSnack } from "../../components/snackbar";
import { VALIDATE_PATTERN } from "../../common/validate-pattern";

export default function SignUp() {
  const methods = useForm<SignUpForm>({
    resolver: zodResolver(SignUpSchema),
  });

  const { handleSubmit, control } = methods;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);

      const result = await registerSalon({
        email: data.email,
        name: data.salon_name?.trim().toLowerCase(),
        password: data.password,
      });

      if (result?.message?.includes("OTP already sent")) {
        callSnack("OTP already sent. Please check your email", "success");
      } else if (result?.message?.includes("OTP sent to your email")) {
        callSnack("OTP sent to your email", "success");
      }
      navigate("/verify-salon", { state: { email: data.email } });
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message || err?.response?.data;

      if (backendMessage.includes("Email already registered")) {
        methods.setError("email", { type: "manual", message: "Email already registered. Please login." });
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
            <Box>Create Salon Account</Box>
            <Box className="text-(--primary-900)">Join us to manage you salon</Box>
          </Box>
          <Box className="space-y-6">
            <Box className="space-y-3">
              <Box className="flex flex-col gap-2">
                <Typography>Salon Name</Typography>
                <TextField
                  type="text"
                  label="Salon Name"
                  name="salon_name"
                  control={control}
                  identifier="signup-salon-name"
                  disabled={isLoading}
                  pattern={VALIDATE_PATTERN.alphabet}
                />
              </Box>
              <Box className="flex flex-col gap-2">
                <Typography>Email</Typography>
                <TextField
                  type="text"
                  label="Email"
                  name="email"
                  control={control}
                  identifier="signup-email"
                  disabled={isLoading}
                  pattern={VALIDATE_PATTERN.noSpace}
                />
              </Box>
              <Box className="flex flex-col gap-2">
                <Typography>Password</Typography>
                <PasswordField
                  label="Password"
                  name="password"
                  control={control}
                  identifier="signup-password"
                  disabled={isLoading}
                />
              </Box>
              <Box className="flex flex-col gap-2">
                <Typography>Confirm Password</Typography>
                <PasswordField
                  label="Confirm Password"
                  name="confirm_password"
                  control={control}
                  identifier="signup-confirm-password"
                  disabled={isLoading}
                />
              </Box>
            </Box>
            <Box className="w-full flex items-center justify-center">
              <Button variant="contained" disabled={isLoading} fullWidth type="submit" startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : undefined}>
                {isLoading ? "Registering..." : "Register"}
              </Button>
            </Box>
            <Box className="flex justify-center items-center">
              <Box className="flex flex-row gap-1 text-gray-600">
                Already have an account ?
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
