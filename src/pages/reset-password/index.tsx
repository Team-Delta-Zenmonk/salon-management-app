import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordSchema, type ResetPasswordForm } from "./schema/reset-password.schema";
import { Scissors, Loader2, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PasswordField from "../../components/form/password-field";
import { resetPassword } from "../../features/auth/reset-password/reset-password.service";
import { callSnack } from "../../components/snackbar";
import { Button } from "../../components/ui/button";
import { motion } from "framer-motion";

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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } | string } };
      const backendMessage = (typeof error?.response?.data === 'string' ? error.response.data : error?.response?.data?.message) || "";

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
              Secure Password Update
            </div>
            <h1 className="text-4xl font-black text-white leading-tight mb-4">
              Set a strong<br />
              <span className="text-primary">new password.</span>
            </h1>
            <p className="text-white/60 text-base leading-relaxed mb-10 max-w-xs">
              Complete your account recovery by setting up a fresh, secure credential to access your dashboard.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <KeyRound className="w-4.5 h-4.5 text-white/80" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Password Strength Guidelines</p>
                  <p className="text-white/55 text-xs max-w-xs">Make sure it's unique, long, and includes numbers/special symbols to protect your platform access.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4.5 h-4.5 text-white/80" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Instant Access After Change</p>
                  <p className="text-white/55 text-xs max-w-xs">Once reset successfully, you'll be redirected immediately to log in with your updated credentials.</p>
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
                Set a new password
              </h2>
              <p className="text-muted-foreground text-sm">
                Create a strong password to secure your salon account.
              </p>
            </div>

            <FormProvider {...methods}>
              <form onSubmit={onSubmit} className="space-y-4">
                <motion.div
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <PasswordField
                    label="New password"
                    name="password"
                    control={control}
                    identifier="reset-password"
                    disabled={isLoading}
                    placeholder="••••••••"
                  />
                </motion.div>
                <motion.div
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.32 }}
                >
                  <PasswordField
                    label="Confirm new password"
                    name="confirm_password"
                    control={control}
                    identifier="reset-confirm-password"
                    disabled={isLoading}
                    placeholder="••••••••"
                  />
                </motion.div>
                <motion.div
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.39 }}
                  className="pt-1"
                >
                  <Button
                    disabled={isLoading}
                    className="w-full h-11 font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/35 transition-all"
                    type="submit"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Resetting...
                      </>
                    ) : "Reset password"}
                  </Button>
                </motion.div>
              </form>
            </FormProvider>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
