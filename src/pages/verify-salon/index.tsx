import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Scissors, Loader2, RotateCcw, MailCheck, MailQuestion } from "lucide-react";
import { useEffect, useState } from "react";
import { VerifyEmailSchema, type VerifyEmailForm } from "./schema/verify-email.schema";
import OTPInput from "../../components/form/otp-input";
import { useLocation, useNavigate } from "react-router-dom";
import { resendOTP } from "../../features/salon-onboarding/resend-otp/resend-otp.service";
import { callSnack } from "../../components/snackbar";
import { useAppDispatch } from "../../store/hooks";
import { verifySalonAction } from "../../features/auth/verify-salon/verify-salon.action";
import { Button } from "../../components/ui/button";
import { motion } from "framer-motion";

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
    } catch (err: unknown) {
      const error = err as { response?: { data?: string } };
      if (error.response?.data?.includes("OTP expired")) {
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

  // Timer progress: 0–30s maps to 100–0%
  const timerProgress = (timer / 30) * 100;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left — Branding Panel */}
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[45%] flex-col relative overflow-hidden bg-[#211922] dark:bg-black border-r border-border/30 dark:border-border/20"
      >
        {/* Gradient blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Scissors className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">Salonify</span>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-10 pb-16">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Account Verification
            </div>
            <h1 className="text-4xl font-black text-white leading-tight mb-4">
              Confirm your<br />
              <span className="text-primary">email identity.</span>
            </h1>
            <p className="text-white/60 text-base leading-relaxed mb-10 max-w-xs">
              Verify your email address using the code we sent. This protects your workspace registration.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <MailCheck className="w-4.5 h-4.5 text-white/80" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Verify Owner Identity</p>
                  <p className="text-white/55 text-xs max-w-xs">Ensuring registration email belongs to the actual salon business owner.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <MailQuestion className="w-4.5 h-4.5 text-white/80" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Didn't get the email?</p>
                  <p className="text-white/55 text-xs max-w-xs">Check your spam folder or wait for the countdown to request a brand new code.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom message */}
        <div className="relative z-10 px-10 pb-10">
          <div className="border-t border-white/10 pt-6">
            <p className="text-white/50 text-xs font-medium">
              Streamlining operations, scheduling, and staff management for modern salons worldwide.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Right — Form Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-hidden"
      >
        {/* Subtle grid pattern & glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Scissors className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <span className="text-lg font-black text-foreground tracking-tight">Salonify</span>
        </div>

        <div className="w-full max-w-md relative z-10">
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="bg-card dark:bg-neutral-900 border border-border/60 rounded-3xl shadow-xl shadow-foreground/5 p-6 sm:p-10"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-black text-foreground tracking-tight mb-1.5">
                Verify your email
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-1">
                We sent a 6-digit code to
              </p>
              <p className="text-foreground font-semibold text-sm truncate">{email}</p>
            </div>

            <FormProvider {...methods}>
              <form onSubmit={onSubmit} className="space-y-6">
                {/* OTP input */}
                <div className="flex justify-center">
                  <OTPInput
                    name="otp"
                    control={control}
                    length={6}
                    disabled={isLoading}
                    identifier="verify-email-otp"
                  />
                </div>

                {/* Timer / Resend */}
                <div className="flex flex-col items-center gap-3">
                  {!canResend ? (
                    <div className="w-full space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Code expires in</span>
                        <span className="font-semibold text-foreground tabular-nums">{timer}s</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          animate={{ width: `${timerProgress}%` }}
                          transition={{ duration: 1, ease: "linear" }}
                        />
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm font-semibold text-primary hover:text-primary/80"
                      onClick={handleResend}
                      type="button"
                      disabled={isLoading || resendLoading}
                    >
                      {resendLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Resending...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                          Resend code
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/35 transition-all"
                  disabled={isLoading || resendLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : "Verify & continue"}
                </Button>
              </form>
            </FormProvider>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors font-semibold"
              >
                Wrong email? Back to sign up
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
