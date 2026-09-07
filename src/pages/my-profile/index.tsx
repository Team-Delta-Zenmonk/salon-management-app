import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import type { RootState } from "../../store/store";
import { getSalonProfileAction } from "../../features/auth/profile/get-salon-profile/getSalonProfile.action";
import { updateSalonProfileAction } from "../../features/auth/profile/update-salon-profile/update-salon-profile.action";
import { callSnack } from "../../components/snackbar";
import { zodResolver } from "@hookform/resolvers/zod";
import LogoutButton from "../../components/logout";
import { MyProfileSchema, type SalonProfileForm } from "./schema/my-profile.schema";
import { DAYS_MAP } from "./_components/constants/business-hours.constants";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "../../components/ui/carousel";

import { GeneralInfoSection, BrandingSection } from "./_components/general-tab/index";
import { LocationSection } from "./_components/location-tab/index";
import { HoursSection } from "./_components/hours-tab/index";
import PaymentPolicyCard from "./_components/payment-policy-card/index";

import {
  AlertCircle,
  RotateCcw,
  Save,
  Loader2,
} from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 26 } }
};

interface PhotoType {
  url: string;
  filename?: string;
}

const MyProfile = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const dispatch = useAppDispatch();
  const { salon } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (salon?.uuid) {
      dispatch(getSalonProfileAction(salon.uuid)).finally(() => setLoading(false));
    }
  }, [dispatch, salon?.uuid]);

  const getMappedInitialHours = () => {
    const hours: Record<string, unknown> = {
      monday: null, tuesday: null, wednesday: null, thursday: null, friday: null, saturday: null, sunday: null
    };
    if (salon?.business_hours) {
      Object.entries(salon.business_hours).forEach(([key, value]) => {
        const dayName = DAYS_MAP[key];
        if (dayName) hours[dayName] = value;
      });
    }
    return hours as SalonProfileForm["business_hours"];
  };

  const methods = useForm<SalonProfileForm>({
    resolver: zodResolver(MyProfileSchema),
    values: {
      name: salon?.name || "",
      owner_name: salon?.owner_name || "",
      email: salon?.email || "",
      phone: salon?.phone || "",
      about: salon?.about || "",
      type: salon?.type || "",
      address: {
        address: salon?.address || "",
        map_link: salon?.map_link || "",
        latitude: salon?.latitude?.toString() || "",
        longitude: salon?.longitude?.toString() || ""
      },
      logo: salon?.logo ? { url: salon.logo, filename: "Logo" } : null,
      photos: salon?.photos || [],
      business_hours: getMappedInitialHours(),
      payment_policy: (salon as any)?.payment_policy || "pay_at_venue",
      deposit_percentage: (salon as any)?.deposit_percentage ?? null,
    }
  });

  const { control, handleSubmit, setValue, clearErrors, watch, reset, formState: { isDirty } } = methods;

  const onSubmit = async (data: SalonProfileForm) => {
    setIsSaving(true);
    try {
      const { logo, address } = data;

      const payload = {
        name: data.name.trim().toLowerCase(),
        owner_name: data.owner_name.trim().toLowerCase(),
        phone: data.phone.trim(),
        about: data.about ? data.about.trim().toLowerCase() : "",
        type: data.type ? data.type.trim().toLowerCase() : "",
        photos: data.photos,
        business_hours: data.business_hours,
        address: address.address.trim().toLowerCase(),
        map_link: address.map_link ? address.map_link.trim().toLowerCase() : null,
        latitude: address.latitude?.toString().trim() || null,
        longitude: address.longitude?.toString().trim() || null,
        logo: logo?.url || null,
        payment_policy: data.payment_policy,
        deposit_percentage: data.payment_policy === "partial_deposit" ? Number(data.deposit_percentage) : null,
      };

      const resultAction = await dispatch(updateSalonProfileAction(payload));
      if (updateSalonProfileAction.fulfilled.match(resultAction)) {
        callSnack("Profile updated successfully", "success");
        if (salon?.uuid) dispatch(getSalonProfileAction(salon.uuid));
        reset(data); 
        return true;
      } else {
        callSnack("Failed to update profile", "error");
        return false;
      }
    } catch {
      callSnack("An error occurred during update", "error");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    handleSubmit(
      async (data: SalonProfileForm) => {
        await onSubmit(data);
      },
      (formErrors) => {
        console.error("Form validation errors:", formErrors);
        callSnack("Please check the form for errors", "error");
      }
    )();
  };

  const activePhotos = (watch("photos") || []) as PhotoType[];
  const activeLogo = watch("logo") as PhotoType | null;
  const activeName = watch("name");
  const activeType = watch("type");

  const openDaysCount = Object.values(watch("business_hours") || {}).filter(Boolean).length;

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col flex-1 h-full min-h-0 w-full overflow-hidden bg-background">

        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 md:px-8 pb-6 shrink-0 gap-4 border-b border-border/20 bg-background/50 backdrop-blur-sm z-10"
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Salon Settings
            </h1>
            <p className="text-muted-foreground/80 text-sm">
              Configure branding, business hours, and operational details
            </p>
          </div>
          <div className="shrink-0 flex gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-40">
              <LogoutButton />
            </div>
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 pb-24">
          <div className="w-full max-w-[1600px] mx-auto space-y-8">

            {loading && !salon ? (
              <div className="space-y-6">
                <div className="w-full h-48 bg-foreground/5 animate-pulse rounded-2xl border border-border/50" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-[380px] bg-foreground/5 animate-pulse rounded-2xl" />
                  <div className="h-[380px] bg-foreground/5 animate-pulse rounded-2xl" />
                </div>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-8"
              >
                <motion.div
                  variants={itemVariants}
                  className="relative group rounded-3xl overflow-hidden border border-border/50 bg-card/60 backdrop-blur-md shadow-lg h-[260px] hover:shadow-xl hover:border-primary/30 transition-all duration-300"
                >
                  {/* Pure Zero-useEffect Automatic Carousel */}
                  {activePhotos.length > 0 ? (
                    <Carousel
                      setApi={setCarouselApi}
                      plugins={[Autoplay({ delay: 4000 })]}
                      opts={{ loop: true }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <CarouselContent className="h-full -ml-0">
                        {activePhotos.map((photo: PhotoType, index: number) => (
                          <CarouselItem key={photo.url || index} className="pl-0 h-[260px] w-full">
                            <img
                              src={photo.url}
                              alt={`Salon Banner ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>

                      {/* Interactive indicator dots */}
                      {activePhotos.length > 1 && (
                        <div className="absolute top-4 right-6 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                          {activePhotos.slice(0, 3).map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                carouselApi?.scrollTo(idx);
                              }}
                              className="w-2.5 h-2.5 rounded-full bg-white/60 hover:bg-white transition-all cursor-pointer"
                              aria-label={`Go to slide ${idx + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </Carousel>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-neutral-900 to-neutral-950" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-8 z-10">
                    <div className="flex items-center gap-5 text-left">
                      <div className="w-24 h-24 rounded-2xl border border-white/20 shrink-0 bg-background overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                        {activeLogo?.url ? (
                          <img src={activeLogo.url} className="object-cover w-full h-full" alt="Logo" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-black">
                            {activeName?.substring(0, 1).toUpperCase() || "S"}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
                          {activeName || "Your Salon"}
                        </h2>
                        <div className="flex items-center gap-2">
                          {activeType && (
                            <Badge variant="secondary" className="bg-white/15 text-white border-white/10 backdrop-blur-sm text-[10px] font-bold py-0.5 px-2.5 rounded-full capitalize">
                              {activeType}
                            </Badge>
                          )}
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 py-0.5 px-2.5 rounded-full text-[10px] font-bold gap-1.5 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Operational
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:flex flex-col items-end gap-1 text-right text-white/95 drop-shadow-md mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-white/60">Operational Schedule</span>
                      <span className="text-sm font-bold">
                        Open {openDaysCount} days a week
                      </span>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    <div className="lg:col-span-7 space-y-8">
                      <GeneralInfoSection control={control} isSaving={isSaving} />

                      <LocationSection
                        control={control}
                        setValue={setValue}
                        clearErrors={clearErrors}
                      />
                    </div>

                    {/* Right Column (col-span-5) - Branding & Schedule */}
                    <div className="lg:col-span-5 space-y-8">
                      <BrandingSection
                        control={control}
                        setValue={setValue}
                        isSaving={isSaving}
                      />

                      <HoursSection
                        control={control}
                        setValue={setValue}
                        isSaving={isSaving}
                      />

                      <PaymentPolicyCard isSaving={isSaving} />
                    </div>

                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-xl"
            >
              <div className="bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <AlertCircle className="h-4 w-4 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground">You have unsaved changes</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      Save to apply operational updates to your salon profile
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => reset()}
                    className="text-[11px] font-bold text-muted-foreground hover:text-foreground h-8 px-2.5 rounded-full cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Discard
                  </Button>
                  <Button
                    size="xs"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="text-[11px] font-bold rounded-full h-8 px-4 shadow-md shadow-primary/20 hover:opacity-95 cursor-pointer bg-primary text-primary-foreground"
                  >
                    {isSaving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    ) : (
                      <Save className="h-3.5 w-3.5 mr-1" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </FormProvider>
  );
};

export default MyProfile;
