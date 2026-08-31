import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ForgotPasswordSchema, type ForgotPasswordForm } from "./schema/forgot-password.schema";
import { Scissors, Loader2, ArrowLeft, CheckCircle2, ShieldAlert, KeyRound } from "lucide-react";
import TextField from "../../components/form/textfield";
import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../features/auth/forgot-password/forgot-password.service";
import { callSnack } from "../../components/snackbar";
import { Button } from "../../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPassword() {
  const methods = useForm<ForgotPasswordForm>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const { handleSubmit, control } = methods;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const onSubmit = onSubmitForm(async (data) => {
    try {
      setIsLoading(true);
      await forgotPassword(data.email);
      setSentTo(data.email);
      setEmailSent(true);
      callSnack("Reset link sent to your email", "success");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } | string } };
      const dataObj = error?.response?.data;
      const backendMessage = typeof dataObj === "string" ? dataObj : dataObj?.message || "";

      if (backendMessage.includes("Salon not found")) {
        methods.setError("email", { type: "manual", message: "Email not registered. Please Login." });
      } else {
        callSnack("Internal server error", "error");
      }
    } finally {
      setIsLoading(false);
    }
  });

  function onSubmitForm(action: (data: ForgotPasswordForm) => Promise<void>) {
    return handleSubmit(action);
  }

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
              Secure Account Recovery
            </div>
            <h1 className="text-4xl font-black text-white leading-tight mb-4">
              Protecting your<br />
              <span className="text-primary">salon data.</span>
            </h1>
            <p className="text-white/60 text-base leading-relaxed mb-10 max-w-xs">
              Recover access safely. We use encrypted reset verification to keep your schedules, reports, and payments secure.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <KeyRound className="w-4.5 h-4.5 text-white/80" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Secure Verification Link</p>
                  <p className="text-white/55 text-xs max-w-xs">Reset links are uniquely signed and expire automatically to prevent unauthorized access.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4.5 h-4.5 text-white/80" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Need Help?</p>
                  <p className="text-white/55 text-xs max-w-xs">If you forgot your registered email address, contact your platform administrator for support.</p>
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

        <div className="w-full max-w-md relative z-10 bg-card dark:bg-neutral-900 border border-border/60 rounded-3xl shadow-xl shadow-foreground/5 p-6 sm:p-10">
          <AnimatePresence mode="wait">
            {!emailSent ? (
              /* Form State */
              <motion.div
                key="form"
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-foreground tracking-tight mb-1.5">
                    Forgot password?
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Enter your email to request a reset link.
                  </p>
                </div>

                <FormProvider {...methods}>
                  <form onSubmit={onSubmit} className="space-y-5">
                    <TextField
                      type="text"
                      label="Email address"
                      name="email"
                      control={control}
                      identifier="forgot-password-email"
                      placeholder="you@yoursalon.com"
                      disabled={isLoading}
                      inputPropsClassName="bg-white dark:bg-neutral-900"
                    />
                    <Button
                      disabled={isLoading}
                      className="w-full h-11 font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                      type="submit"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending link...
                        </>
                      ) : "Send reset link"}
                    </Button>
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
            ) : (
              /* Success State */
              <motion.div
                key="success"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
                  className="flex justify-center mb-6"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                </motion.div>

                <h2 className="text-2xl font-black text-foreground mb-2 tracking-tight">Check your inbox</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-1">
                  We've sent a password reset link to
                </p>
                <p className="text-foreground font-semibold text-sm mb-6">{sentTo}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Didn't receive it? Check your spam folder or{" "}
                  <button
                    onClick={() => setEmailSent(false)}
                    className="text-primary font-semibold hover:underline"
                  >
                    try again
                  </button>
                  .
                </p>

                <div className="mt-8">
                  <Link to="/login">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to sign in
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
