import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginForm } from "./schema/login.schema";
import { Scissors, Loader2, BarChart3, CalendarCheck, Users, Star } from "lucide-react";
import TextField from "../../components/form/textfield";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordField from "../../components/form/password-field";
import { loginSalonAction } from "../../features/auth/login/login.action";
import { useAppDispatch } from "../../store/hooks";
import { callSnack } from "../../components/snackbar";
import { VALIDATE_PATTERN } from "../../common/validate-pattern";
import { Button } from "../../components/ui/button";
import { motion } from "framer-motion";

const features = [
  { icon: CalendarCheck, label: "Smart Bookings", desc: "Manage appointments effortlessly" },
  { icon: Users, label: "Staff Management", desc: "Assign roles and track performance" },
  { icon: BarChart3, label: "Real-time Analytics", desc: "Insights that grow your business" },
  { icon: Star, label: "Customer Loyalty", desc: "Build lasting client relationships" },
];

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
    } catch (err: unknown) {
      const errorPayload = err as { code?: string };
      const code = errorPayload?.code;

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
                Trusted by 500+ salons
              </div>
              <h1 className="text-4xl font-black text-white leading-tight mb-4">
                Run your salon<br />
                <span className="text-primary">smarter.</span>
              </h1>
              <p className="text-white/60 text-base leading-relaxed mb-10 max-w-xs">
                Everything you need to manage bookings, staff, customers, and growth — in one place.
              </p>

              {/* Feature list */}
              <div className="space-y-4">
                {features.map(({ icon: Icon, label, desc }, i) => (
                  <motion.div
                    key={label}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-white/80" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{label}</p>
                      <p className="text-white/50 text-xs">{desc}</p>
                    </div>
                  </motion.div>
                ))}
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
              transition={{ delay: 0.15, duration: 0.5 }}
              className="bg-card dark:bg-neutral-900 border border-border/60 rounded-3xl shadow-xl shadow-foreground/5 p-6 sm:p-10"
            >
              <div className="mb-8">
                <h2 data-test-id="text-login-form-title" className="text-2xl font-black text-foreground tracking-tight mb-1.5">
                  Welcome back
                </h2>
                <p className="text-muted-foreground text-sm">Sign in to your salon account</p>
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <TextField
                    type="text"
                    label="Email address"
                    name="email"
                    control={control}
                    identifier="login-form-email"
                    placeholder="you@yoursalon.com"
                    disabled={isLoading}
                    pattern={VALIDATE_PATTERN.noSpace}
                    inputPropsClassName="bg-white dark:bg-neutral-900"
                  />
                </motion.div>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.32 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-foreground">Password</label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <PasswordField
                    label=""
                    name="password"
                    control={control}
                    identifier="login-form-password"
                    disabled={isLoading}
                    placeholder="••••••••"
                  />
                </motion.div>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.39 }}
                  className="pt-1"
                >
                  <Button
                    disabled={isLoading}
                    className="w-full h-11 font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                    type="submit"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : "Sign in"}
                  </Button>
                </motion.div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                    Register your salon
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </FormProvider>
  );
}
