import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpSchema, type SignUpForm } from "./schema/signup.schema";
import { Scissors, Loader2, CheckCircle2 } from "lucide-react";
import TextField from "../../components/form/textfield";
import { useState } from "react";
import PasswordField from "../../components/form/password-field";
import { registerSalon } from "../../features/salon-onboarding/register-salon/register-salon.service";
import { useNavigate, Link } from "react-router-dom";
import { callSnack } from "../../components/snackbar";
import { VALIDATE_PATTERN } from "../../common/validate-pattern";
import { Button } from "../../components/ui/button";
import { motion } from "framer-motion";

const benefits = [
  "Unlimited appointments & bookings",
  "Staff scheduling & role management",
  "Customer profiles & loyalty tracking",
  "Real-time reports & analytics",
  "Inventory & product management",
  "Automated reminders & notifications",
];

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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } | string } };
      const backendMessage = (typeof error?.response?.data === 'string' ? error.response.data : error?.response?.data?.message) || "";

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
      <div className="min-h-screen flex bg-background">
        {/* Left — Form Panel */}
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
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Scissors className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="text-lg font-black text-foreground tracking-tight">Salonify</span>
          </div>

          <div className="w-full max-w-md relative z-10">
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="bg-card dark:bg-neutral-900 border border-border/60 rounded-3xl shadow-xl shadow-foreground/5 p-6 sm:p-10"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-black text-foreground tracking-tight mb-1.5">
                  Register your salon
                </h2>
                <p className="text-muted-foreground text-sm">Join thousands of salons managing smarter</p>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                {[
                  {
                    delay: 0.2,
                    content: (
                      <TextField
                        type="text"
                        label="Salon Name"
                        name="salon_name"
                        control={control}
                        identifier="signup-salon-name"
                        placeholder="e.g. Glamour Studio"
                        disabled={isLoading}
                        pattern={VALIDATE_PATTERN.alphabet}
                        inputPropsClassName="bg-white dark:bg-neutral-900"
                      />
                    ),
                  },
                  {
                    delay: 0.27,
                    content: (
                      <TextField
                        type="text"
                        label="Email address"
                        name="email"
                        control={control}
                        identifier="signup-email"
                        placeholder="you@yoursalon.com"
                        disabled={isLoading}
                        pattern={VALIDATE_PATTERN.noSpace}
                        inputPropsClassName="bg-white dark:bg-neutral-900"
                      />
                    ),
                  },
                  {
                    delay: 0.34,
                    content: (
                      <PasswordField
                        label="Password"
                        name="password"
                        control={control}
                        identifier="signup-password"
                        disabled={isLoading}
                        placeholder="••••••••"
                      />
                    ),
                  },
                  {
                    delay: 0.41,
                    content: (
                      <PasswordField
                        label="Confirm password"
                        name="confirm_password"
                        control={control}
                        identifier="signup-confirm-password"
                        disabled={isLoading}
                        placeholder="••••••••"
                      />
                    ),
                  },
                ].map(({ delay, content }, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay }}
                  >
                    {content}
                  </motion.div>
                ))}

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.48 }}
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
                        Creating account...
                      </>
                    ) : "Create account"}
                  </Button>
                </motion.div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right — Benefits Panel */}
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="hidden lg:flex lg:w-[42%] flex-col relative overflow-hidden bg-[#211922] dark:bg-black border-l border-border/30 dark:border-border/20"
        >
          {/* Gradient blobs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4 pointer-events-none" />

          {/* Logo */}
          <div className="relative z-10 p-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Scissors className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">Salonify</span>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col justify-center px-10 pb-16">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.6 }}
            >
              <h2 className="text-3xl font-black text-white leading-tight mb-3">
                Everything your salon<br />
                <span className="text-primary">needs to thrive.</span>
              </h2>
              <p className="text-white/55 text-sm mb-8 max-w-xs">
                Join our platform and get access to powerful tools built specifically for salons.
              </p>

              <div className="space-y-3">
                {benefits.map((benefit, i) => (
                  <motion.div
                    key={benefit}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.35 + i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-white/80 text-sm">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              {/* Stats */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-10 grid grid-cols-3 gap-4"
              >
                {[
                  { value: "500+", label: "Salons" },
                  { value: "50K+", label: "Bookings" },
                  { value: "4.9★", label: "Rating" },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <p className="text-white text-lg font-black">{value}</p>
                    <p className="text-white/40 text-xs">{label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </FormProvider>
  );
}
