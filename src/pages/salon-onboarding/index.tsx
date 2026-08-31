import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormProvider, useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Scissors, Loader2, Check, User, Store, MapPin, KeyRound, Sparkles, Navigation } from "lucide-react";
import OwnerStep from "./_components/onboarding-steps/owner-step";
import SalonStep from "./_components/onboarding-steps/salon-step";
import AddressStep from "./_components/onboarding-steps/address-step";
import { callSnack } from "../../components/snackbar";
import { SalonOnboardingSchema, type SalonOnboardingForm } from "./schema/salon-onboarding.schema";
import { updateSalon } from "../../features/salon-onboarding/update-salon/update-salon.service";
import { useAppDispatch } from "../../store/hooks";
import { completeOnboarding } from "../../features/auth/auth.slice";
import { Button } from "../../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { label: "Owner", desc: "Your details", icon: User },
  { label: "Salon", desc: "Profile & branding", icon: Store },
  { label: "Location", desc: "Address & map", icon: MapPin },
];

const TOTAL_STEPS = STEPS.length;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const STEP_INFO = [
  {
    title: "Verify Owner Identity",
    desc: "We collect the legal name of the salon representative to verify official credentials and secure your business identity.",
    icon: KeyRound,
    badge: "Owner Identification",
  },
  {
    title: "Upload Your Branding",
    desc: "Your logo and photos are displayed on client booking pages. Salons with photos receive up to 40% more booking interest.",
    icon: Sparkles,
    badge: "Salon Portfolio",
  },
  {
    title: "Pin Your Location",
    desc: "Enter a clear address and map coordinates. Clients will use this directly to get directions on Google or Apple Maps.",
    icon: Navigation,
    badge: "Coordinates Setup",
  },
];

export default function SalonOnboarding() {
  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const methods = useForm<SalonOnboardingForm>({
    resolver: zodResolver(SalonOnboardingSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      owner: { owner_name: "" },
      salon: {
        type: "",
        logo: null,
        photos: [],
      },
      address: {
        address: "",
        map_link: "",
        latitude: undefined,
        longitude: undefined,
      },
    },
  });

  const { trigger, getValues } = methods;

  const handleNext = async () => {
    let fieldsToValidate: (FieldPath<SalonOnboardingForm>)[] = [];

    if (activeStep === 0) fieldsToValidate = ["owner.owner_name" as FieldPath<SalonOnboardingForm>];
    if (activeStep === 1) fieldsToValidate = ["salon.type" as FieldPath<SalonOnboardingForm>, "salon.logo" as FieldPath<SalonOnboardingForm>, "salon.photos" as FieldPath<SalonOnboardingForm>];
    if (activeStep === 2) fieldsToValidate = ["address.address" as FieldPath<SalonOnboardingForm>, "address.map_link" as FieldPath<SalonOnboardingForm>];

    const isValid = await trigger(fieldsToValidate);
    if (!isValid) return;

    if (activeStep < TOTAL_STEPS - 1) {
      setDirection(1);
      setActiveStep((s) => s + 1);
      return;
    }
    const data = getValues();
    try {
      setIsLoading(true);
      await updateSalon({
        owner_name: data.owner?.owner_name,
        type: data.salon?.type,
        logo: data.salon?.logo?.url,
        photos: data.salon.photos,
        latitude: String(data?.address?.latitude),
        longitude: String(data?.address?.longitude),
        address: data?.address?.address,
        map_link: data?.address?.map_link,
        is_onboarded: true,
      });
      dispatch(completeOnboarding({}));
      callSnack("Onboarding completed", "success");
      navigate("/dashboard");
    } catch {
      callSnack("Failed to save salon details", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (activeStep === 0) return;
    setDirection(-1);
    setActiveStep((s) => s - 1);
  };

  const isLastStep = activeStep === TOTAL_STEPS - 1;
  const currentInfo = STEP_INFO[activeStep];
  const StepIcon = currentInfo.icon;

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen flex bg-background">
        {/* Left — Branding Panel */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="hidden lg:flex lg:w-[45%] flex-col relative overflow-hidden bg-[#211922] dark:bg-black border-r border-border/30 dark:border-border/20 shrink-0"
        >
          {/* Gradient blobs */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/25 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/15 rounded-full blur-3xl translate-x-1/4 translate-y-1/4 pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="relative z-10 p-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Scissors className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">Salonify</span>
            </div>
          </div>

          {/* Hero content — dynamically changes with step */}
          <div className="relative z-10 flex-1 flex flex-col justify-center px-10 pb-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  {currentInfo.badge}
                </div>
                <h1 className="text-4xl font-black text-white leading-tight mb-4">
                  {currentInfo.title}
                </h1>
                <p className="text-white/60 text-base leading-relaxed mb-10 max-w-xs">
                  {currentInfo.desc}
                </p>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <StepIcon className="w-4.5 h-4.5 text-white/80" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Step Guide</p>
                    <p className="text-white/55 text-xs max-w-xs">
                      Provide accurate information to complete your registration setup smoothly.
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
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

          <div className="w-full max-w-3xl">
            {/* Stepper card */}
            <div className="bg-card dark:bg-neutral-900 border border-border/60 rounded-3xl shadow-xl shadow-foreground/5 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
              
              {/* Progress stepper (HORIZONTAL - Mobile) */}
              <div className="flex md:hidden items-start justify-between px-6 pt-6 pb-4 border-b border-border/40 bg-muted/10">
                {STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const isCompleted = i < activeStep;
                  const isCurrent = i === activeStep;

                  return (
                    <div key={step.label} className={i < STEPS.length - 1 ? "flex-1 flex items-start" : "flex items-start"}>
                      {/* Step bubble */}
                      <div className="flex flex-col items-center shrink-0 w-12">
                        <motion.div
                          animate={{
                            backgroundColor: isCompleted ? "var(--primary)" : isCurrent ? "var(--primary)" : "var(--muted)",
                            scale: isCurrent ? 1.05 : 1,
                          }}
                          transition={{ duration: 0.3 }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center relative transition-all ${
                            isCurrent ? "shadow-[0_0_15px_rgba(249,115,22,0.4)] ring-4 ring-primary/20" : isCompleted ? "shadow-sm" : "border border-border/40"
                          }`}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5 text-primary-foreground" /> : <Icon className={`w-3.5 h-3.5 ${isCurrent ? "text-primary-foreground" : "text-muted-foreground"}`} />}
                          {isCurrent && <motion.div layoutId="stepRingMobile" className="absolute inset-0 rounded-full border-2 border-primary" style={{ margin: -4 }} transition={{ duration: 0.3 }} />}
                        </motion.div>
                        <span className={`text-[10px] font-bold mt-2 transition-colors text-center ${isCurrent ? "text-primary font-black" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </span>
                      </div>
                      {/* Connector */}
                      {i < STEPS.length - 1 && (
                        <div className="flex-1 mt-4 mx-2 h-1 bg-border/40 rounded-full overflow-hidden">
                          <motion.div className="h-full bg-primary" animate={{ width: i < activeStep ? "100%" : "0%" }} transition={{ duration: 0.4 }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Progress stepper (VERTICAL - Desktop) */}
              <div className="hidden md:flex w-[140px] flex-col justify-between py-10 border-r border-border/40 bg-muted/10 shrink-0">
                {STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const isCompleted = i < activeStep;
                  const isCurrent = i === activeStep;

                  return (
                    <div key={step.label} className={i < STEPS.length - 1 ? "flex-1 flex flex-col items-center" : "flex flex-col items-center"}>
                      {/* Step bubble & Label */}
                      <div className="flex flex-col items-center gap-2 relative z-10 px-2">
                        <motion.div
                          animate={{
                            backgroundColor: isCompleted ? "var(--primary)" : isCurrent ? "var(--primary)" : "var(--muted)",
                            scale: isCurrent ? 1.05 : 1,
                          }}
                          transition={{ duration: 0.3 }}
                          className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center relative transition-all ${
                            isCurrent ? "shadow-[0_0_15px_rgba(249,115,22,0.4)] ring-4 ring-primary/20" : isCompleted ? "shadow-sm" : "border border-border/40"
                          }`}
                        >
                          {isCompleted ? <Check className="w-4 h-4 text-primary-foreground" /> : <Icon className={`w-4 h-4 ${isCurrent ? "text-primary-foreground" : "text-muted-foreground"}`} />}
                          {isCurrent && <motion.div layoutId="stepRingDesktop" className="absolute inset-0 rounded-full border-2 border-primary" style={{ margin: -4 }} transition={{ duration: 0.3 }} />}
                        </motion.div>
                        <span className={`text-xs text-center font-bold transition-colors ${isCurrent ? "text-primary font-black" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </span>
                      </div>
                      {/* Connector */}
                      {i < STEPS.length - 1 && (
                        <div className="w-1 mx-auto my-3 flex-1 bg-border/40 rounded-full overflow-hidden">
                          <motion.div className="w-full bg-primary" animate={{ height: i < activeStep ? "100%" : "0%" }} transition={{ duration: 0.4 }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Form Content Area */}
              <div className="flex-1 flex flex-col justify-between relative bg-card dark:bg-neutral-900">

              {/* Card header */}
              <div className="px-6 pt-6 pb-1">
                <motion.div key={activeStep} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-wider mb-2">
                    Step {activeStep + 1} of {TOTAL_STEPS}
                  </div>
                  <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                    {STEPS[activeStep].desc}
                  </h2>
                </motion.div>
              </div>

              {/* Step content — animated */}
              <div className="px-6 py-5 min-h-[220px] overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={activeStep}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {activeStep === 0 && <OwnerStep />}
                    {activeStep === 1 && <SalonStep />}
                    {activeStep === 2 && <AddressStep />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer nav */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/20">
                <Button
                  variant="ghost"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  className="w-20 text-muted-foreground text-xs rounded-full hover:bg-muted/80 hover:text-foreground transition-colors"
                >
                  Back
                </Button>

                <div className="flex gap-1">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === activeStep ? "w-4 bg-primary" : i < activeStep ? "w-1 bg-primary/40" : "w-1 bg-border"
                      }`}
                    />
                  ))}
                </div>

                <Button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="w-28 text-xs font-semibold rounded-full shadow-md shadow-primary/20 hover:shadow-primary/35 transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      {isLastStep ? "Finishing" : "Saving"}
                    </>
                  ) : isLastStep ? "Finish setup" : "Continue"}
                </Button>
              </div>
            </div>
          </div>
        </div>
        </motion.div>
      </div>
    </FormProvider>
  );
}
