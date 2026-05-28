import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, CircularProgress } from "@mui/material";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import { useEffect, useState } from "react";
import { VerifyEmailSchema, type VerifyEmailForm } from "./schema/verify-email.schema";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import OTPInput from "../../components/form/otp-input";
import { useLocation, useNavigate } from "react-router-dom";
import { resendOTP } from "../../features/salon-onboarding/resend-otp/resend-otp.service";
import { callSnack } from "../../components/snackbar";
import { useAppDispatch } from "../../store/hooks";
import { verifySalonAction } from "../../features/auth/verify-salon/verify-salon.action";

export default function VerifyEmail() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;


  const methods = useForm<VerifyEmailForm>({
    resolver: zodResolver(VerifyEmailSchema),
  });

  const { handleSubmit, control, reset } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);
      await dispatch(verifySalonAction({ otp: data.otp, email: email! })).unwrap();
      callSnack("Email verified successfully", "success");
      navigate("/salon-onboarding", { replace: true });
    } catch (err: any) {
      if (err.response?.data?.includes("OTP expired")) {
        callSnack("OTP expired. Please request a new one.", "error");
      } else {
        callSnack("Internal server error", "error");
      }
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    if (!email) {
      navigate("/unauthorized", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleResend = async () => {
    try {
      setResendLoading(true);
      await resendOTP(email);
      callSnack("OTP resent successfully", "success");
      reset({ otp: "" });
      setTimer(60);
      setCanResend(false);
    } catch {
      callSnack("Failed to resend OTP", "error");
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex items-center justify-center min-h-screen p-4">
        <Box className="w-full max-w-md p-6 flex flex-col gap-4 rounded-xl border border-[#e5e5e5]">
          <Box className="flex flex-col items-center mb-8">
            <Box className="w-16 h-16 bg-(--primary-900) rounded-lg flex items-center justify-center mb-4">
              <ContentCutIcon className="text-white!" />
            </Box>
            <Box>Verify Email</Box>
            <Box className="text-(--primary-900)">Enter 6 digit code send to your Email</Box>
          </Box>
          <Box className="space-y-6">
            <OTPInput name="otp" control={control} length={6} disabled={isLoading} identifier="verify-email-otp" />
            <Box className="flex items-center justify-center gap-2 text-gray-600">
              <Box>
                {canResend ? (
                  <Button
                    variant="outlined"
                    startIcon={
                      resendLoading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <ShieldOutlinedIcon className={isLoading || resendLoading ? "text-gray-400" : "text-(--primary-900)!"} />
                      )
                    }
                    onClick={handleResend}
                    disabled={isLoading || resendLoading}
                  >
                    {resendLoading ? "Resending..." : "Resend OTP"}
                  </Button>
                ) : (
                  <>Resend OTP in {timer}s</>
                )}
              </Box>
            </Box>
            <Box>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || resendLoading} 
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : undefined}
              >
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </Button>
            </Box>
            <Box className="text-center">
              <Button variant="text" onClick={() => navigate("/signup")}>
                Back to sign up
              </Button>
            </Box>
          </Box>
          <Box className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Box className="text-blue-800 text-center">
              <strong>Demo:</strong> Enter any 6 digits to continue
            </Box>
          </Box>
        </Box>
      </form>
    </FormProvider>
  );
}
