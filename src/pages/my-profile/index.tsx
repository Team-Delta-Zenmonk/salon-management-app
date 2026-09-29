import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { motion, type Variants } from "framer-motion";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import type { RootState } from "../../store/store";
import { getSalonProfileAction } from "../../features/auth/profile/get-salon-profile/getSalonProfile.action";
import { updateSalonProfileAction } from "../../features/auth/profile/update-salon-profile/update-salon-profile.action";
import { callSnack } from "../../components/snackbar";
import { zodResolver } from "@hookform/resolvers/zod";
import { MyProfileSchema, type SalonProfileForm } from "./schema/my-profile.schema";
import { DAYS_MAP } from "./_components/constants/business-hours.constants";
import { Badge } from "../../components/ui/badge";
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "../../components/ui/carousel";
import { cn } from "../../lib/utils";
import { ImagePlus } from "lucide-react";

import { GeneralInfoSection, BrandingSection } from "./_components/general-tab/index";
import { LocationSection, ContactSection } from "./_components/location-tab/index";
import { HoursSection } from "./_components/hours-tab/index";
import PaymentPolicyCard from "./_components/payment-policy-card/index";
import { UnsavedChangesBanner } from "../../components/unsaved-changes-banner";
import { EllipsisCell } from "../../components/ellipse-cell";
import type { CloudinaryFile } from "../../common/cloudinary.schema";

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

interface PhotoType extends Partial<CloudinaryFile> {
  url: string;
  filename?: string;
}

const MyProfile = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const dispatch = useAppDispatch();
  const { salon } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCurrentSlideIndex(carouselApi.selectedScrollSnap());
    };

    onSelect();
    carouselApi.on("select", onSelect);

    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

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

  const getMappedInitialAddress = () => {
    const fullAddr = salon?.address || "";
    let street = "";
    let city = "";
    let state = "";
    let pincode = "";

    if (fullAddr) {
      const parts = fullAddr.split(",").map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 4) {
        street = parts.slice(0, parts.length - 3).join(", ");
        city = parts[parts.length - 3];
        state = parts[parts.length - 2];
        pincode = parts[parts.length - 1];
      } else if (parts.length === 3) {
        street = parts[0];
        city = parts[1];
        state = parts[2];
      } else if (parts.length === 2) {
        street = parts[0];
        city = parts[1];
      } else {
        street = fullAddr;
      }
    }

    return {
      address: fullAddr,
      map_link: salon?.map_link || "",
      latitude: salon?.latitude?.toString() || "",
      longitude: salon?.longitude?.toString() || "",
      street,
      city,
      state,
      pincode
    };
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
      address: getMappedInitialAddress(),
      logo: salon?.logo ? { url: salon.logo, filename: "Logo" } : null,
      photos: salon?.photos || [],
      business_hours: getMappedInitialHours(),
      allowed_payment_policies: (salon as any)?.allowed_payment_policies?.length
        ? (salon as any).allowed_payment_policies
        : ["pay_at_venue"],
      deposit_percentage: (salon as any)?.deposit_percentage ?? null,
    }
  });

  const { control, handleSubmit, setValue, clearErrors, watch, reset, formState: { isDirty } } = methods;

  const onSubmit = async (data: SalonProfileForm) => {
    setIsSaving(true);
    try {
      const { logo, address } = data;
      const compiledAddress = [address.street, address.city, address.state, address.pincode]
        .filter(Boolean)
        .join(", ");
      const finalAddress = (compiledAddress || address.address || "").trim().toLowerCase();

      const payload = {
        name: data.name.trim().toLowerCase(),
        owner_name: data.owner_name.trim().toLowerCase(),
        phone: data.phone.trim(),
        about: data.about ? data.about.trim().toLowerCase() : "",
        type: data.type ? data.type.trim().toLowerCase() : "",
        photos: data.photos,
        business_hours: data.business_hours,
        address: finalAddress,
        map_link: address.map_link ? address.map_link.trim().toLowerCase() : null,
        latitude: address.latitude?.toString().trim() || null,
        longitude: address.longitude?.toString().trim() || null,
        logo: logo?.url || null,
        allowed_payment_policies: data.allowed_payment_policies,
        deposit_percentage: data.allowed_payment_policies.includes("partial_deposit") ? Number(data.deposit_percentage) : null,
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
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 md:px-8 shrink-0 gap-4 bg-background/50 backdrop-blur-sm z-10"
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Salon Settings
            </h1>
            <p className="text-muted-foreground/80 text-sm">
              Configure branding, business hours, and operational details
            </p>
          </div>
        </motion.div>

        <div className={`flex-1 overflow-y-auto px-4 md:px-8 pt-6 ${
          !isDirty ? "" : "pb-28"
        }`}>
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
                  className="relative group rounded-2xl overflow-hidden border border-border/50 bg-card/60 backdrop-blur-md shadow-lg min-h-[210px] sm:min-h-[240px] md:h-[260px] hover:shadow-xl hover:border-primary/30 transition-all duration-300 w-full"
                >
                  {activePhotos.length > 0 ? (
                    <Carousel
                      setApi={setCarouselApi}
                      plugins={[Autoplay({ delay: 4000 })]}
                      opts={{ loop: true }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <CarouselContent className="h-full -ml-0">
                        {activePhotos.map((photo: PhotoType, index: number) => (
                          <CarouselItem key={photo.url || index} className="pl-0 min-h-[210px] sm:min-h-[240px] md:h-[260px] w-full">
                            <img
                              src={photo.url}
                              alt={`Salon Banner ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>

                      {activePhotos.length > 1 && (
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-6 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 shadow-lg">
                          <div className="flex items-center gap-1.5">
                            {activePhotos.map((_, idx) => {
                              const isActive = currentSlideIndex === idx;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    carouselApi?.scrollTo(idx);
                                  }}
                                  className={cn(
                                    "h-2 rounded-full transition-all duration-300 cursor-pointer",
                                    isActive
                                      ? "w-5 bg-white shadow-sm ring-1 ring-white/50"
                                      : "w-2 bg-white/40 hover:bg-white/80"
                                  )}
                                  aria-label={`Go to slide ${idx + 1}`}
                                  title={`Slide ${idx + 1}`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </Carousel>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-background flex items-center justify-center p-4">
                      <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                      <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-card/80 border border-border/60 text-muted-foreground text-[11px] sm:text-xs backdrop-blur-md z-10 shadow-xs max-w-[92%] -translate-y-4 sm:-translate-y-6">
                        <ImagePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                        <span className="truncate hidden sm:inline">No cover photos added yet • Upload photos in Branding below</span>
                        <span className="truncate sm:hidden">No cover photos • Add in Branding</span>
                      </div>
                    </div>
                  )}

                  <div className={cn(
                    "absolute inset-0 pointer-events-none",
                    activePhotos.length > 0
                      ? "bg-gradient-to-t from-black/90 via-black/40 to-transparent"
                      : "bg-gradient-to-t from-card via-card/50 to-transparent"
                  )} />

                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3.5 sm:p-6 md:p-8 z-10 gap-3 sm:gap-4">
                    <div className="flex items-center gap-2.5 sm:gap-4 md:gap-5 text-left min-w-0 flex-1">
                      <div className={cn(
                        "w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl border shrink-0 bg-background overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300",
                        activePhotos.length > 0 ? "border-white/20" : "border-border/60"
                      )}>
                        <img
                          src={activeLogo?.url || "/management-icon.png"}
                          className="object-cover w-full h-full"
                          alt="Salon Logo"
                        />
                      </div>

                      <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
                        <EllipsisCell
                          value={activeName || "Your Salon"}
                          className={cn(
                            "text-lg sm:text-xl md:text-2xl font-black tracking-tight capitalize block min-w-0",
                            activePhotos.length > 0 ? "text-white drop-shadow-md" : "text-foreground"
                          )}
                        />
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          {activeType && (
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-[9px] sm:text-[10px] font-bold py-0.5 px-2 sm:px-2.5 rounded-full capitalize",
                                activePhotos.length > 0 ? "bg-white/15 text-white border-white/10 backdrop-blur-sm" : "bg-muted/80 text-foreground border-border/40"
                              )}
                            >
                              {activeType}
                            </Badge>
                          )}
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 py-0.5 px-2 sm:px-2.5 rounded-full text-[9px] sm:text-[10px] font-bold gap-1.5 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Operational
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className={cn(
                      "hidden md:flex flex-col items-end gap-1 text-right shrink-0 mb-1",
                      activePhotos.length > 0 ? "text-white/95 drop-shadow-md" : "text-foreground"
                    )}>
                      <span className={cn(
                        "text-[10px] uppercase font-bold tracking-wider",
                        activePhotos.length > 0 ? "text-white/60" : "text-muted-foreground"
                      )}>Operational Schedule</span>
                      <span className="text-sm font-bold">
                        Open {openDaysCount} days a week
                      </span>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="w-full space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    <div className="lg:col-span-7 space-y-8">
                      <GeneralInfoSection control={control} isSaving={isSaving} />

                      <LocationSection
                        control={control}
                        setValue={setValue}
                        clearErrors={clearErrors}
                      />
                    </div>

                    <div className="lg:col-span-5 space-y-8 min-w-0 w-full">
                      <ContactSection control={control} />

                      <BrandingSection
                        control={control}
                        setValue={setValue}
                        isSaving={isSaving}
                      />

                      <PaymentPolicyCard isSaving={isSaving} />
                    </div>

                  </div>

                  <HoursSection
                    control={control}
                    setValue={setValue}
                    isSaving={isSaving}
                  />
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>

        <UnsavedChangesBanner
          isDirty={isDirty}
          message="Save to apply operational updates to your salon profile"
          isSaving={isSaving}
          onSave={handleSave}
          onDiscard={() => reset()}
        />

      </div>
    </FormProvider>
  );
};

export default MyProfile;
