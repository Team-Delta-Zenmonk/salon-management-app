import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Box, Grid, CircularProgress, Typography, Button } from "@mui/material";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import type { RootState } from "../../store/store";
import { getSalonProfileAction } from "../../features/auth/profile/get-salon-profile/getSalonProfile.action";
import { updateSalonProfileAction } from "../../features/auth/profile/update-salon-profile/update-salon-profile.action";
import { callSnack } from "../../components/snackbar";
import { zodResolver } from "@hookform/resolvers/zod";
import ProfileInfoCard from "./_components/profile-info-card";
import SalonWorkingHoursCard from "./_components/salon-working-hours-card";
import PaymentPolicyCard from "./_components/payment-policy-card";
import { MyProfileSchema, type SalonProfileForm } from "./schema/my-profile.schema";
import { DAYS_MAP, DAY_KEYS, DAY_LABELS } from "./_components/constants/business-hours.constants";
import PageHeader from "../../components/page-header";
import { MapContainer, TileLayer, Marker, Tooltip as MapTooltip } from "react-leaflet";
import "yet-another-react-lightbox/styles.css";

const Icons = {
  MapPin: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  ),
  Mail: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  ),
  Phone: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.802-5.14-4.117-6.942-6.942l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  )
};

const formatTime = (time: string) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const h = Number.parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  const h12Str = h12 < 10 ? `0${h12}` : `${h12}`;
  return `${h12Str}:${minutes} ${ampm}`;
};

const MyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useAppDispatch();
  const { salon } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (salon?.uuid) {
      dispatch(getSalonProfileAction(salon.uuid)).finally(() => setLoading(false));
    }
  }, [dispatch, salon?.uuid]);

  const getMappedInitialHours = () => {
    const hours: any = {
      monday: null, tuesday: null, wednesday: null, thursday: null, friday: null, saturday: null, sunday: null
    };
    if (salon?.business_hours) {
      Object.entries(salon.business_hours).forEach(([key, value]) => {
        const dayName = DAYS_MAP[key];
        if (dayName) hours[dayName] = value;
      });
    }
    return hours;
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
      payment_policy: salon?.payment_policy || "full_upfront",
      deposit_percentage: salon?.deposit_percentage || undefined
    }
  });

  const { control, handleSubmit, reset, setValue, clearErrors, watch } = methods;

  const onSubmit = async (data: SalonProfileForm) => {
    setIsSaving(true);
    try {
      const { email, logo, address, ...updateData } = data;

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
        setIsEditing(false);
        if (salon?.uuid) dispatch(getSalonProfileAction(salon.uuid));
      } else {
        callSnack("Failed to update profile", "error");
      }
    } catch {
      callSnack("An error occurred during update", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  if (loading && !salon) {
    return (
      <Box className="flex items-center justify-center h-[400px]">
        <CircularProgress />
      </Box>
    );
  }

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const coverPhoto = salon?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1400';
  const logoPhoto = salon?.logo || 'https://images.unsplash.com/photo-1517832606589-7a598bdd60ca?auto=format&fit=crop&q=80&w=300';

  const allPhotos = salon?.photos?.length ? salon.photos.map((p: any) => p.url) : [coverPhoto];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allPhotos.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === allPhotos.length - 1 ? 0 : prev + 1));
  };

  const mappedHours = getMappedInitialHours();
  const schedule = DAY_KEYS.map((dayKey) => {
    const dayValue = mappedHours[dayKey];
    const isOpen = !!dayValue;
    return {
      day: DAY_LABELS[dayKey] || dayKey,
      status: isOpen ? 'OPEN' : 'CLOSED',
      openTime: isOpen && dayValue?.start_time ? formatTime(dayValue.start_time) : '',
      closeTime: isOpen && dayValue?.end_time ? formatTime(dayValue.end_time) : 'Closed'
    };
  });

  const bookingPolicyText = salon?.payment_policy === 'pay_at_venue' ? 'Pay on Site at Venue' :
    salon?.payment_policy === 'partial_deposit' ? `Hold Deposit ${salon.deposit_percentage || 0}%` : 'Prepaid Upfront';

  return (
    <FormProvider {...methods}>
      <Box className="flex flex-col flex-1 min-h-0 w-full">
        <Box className="flex-1 min-h-0 overflow-y-auto pb-12">
          {isEditing ? (
            <Box sx={{ px: 3, mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, pb: 2, borderBottom: '1px solid #f4f4f5' }}>
                <Typography fontWeight={800}>Edit Profile Settings</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isSaving}
                    sx={{ borderRadius: "10px", borderColor: "#e4e4e7", color: "#3f3f46", textTransform: 'none', fontWeight: 600 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSaving}
                    disableElevation
                    sx={{ borderRadius: "10px", px: 4, textTransform: 'none', fontWeight: 600, bgcolor: '#18181b', color: 'white', '&:hover': { bgcolor: '#27272a' } }}
                  >
                    {isSaving ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
                  </Button>
                </Box>
              </Box>
              <Grid container spacing={4} sx={{ alignItems: "flex-start" }}>
                <Grid size={{ xs: 12, lg: 8 }}>
                  <ProfileInfoCard
                    isEditing={isEditing}
                    control={control}
                    salon={salon}
                    setValue={setValue}
                    clearErrors={clearErrors}
                  />
                  <PaymentPolicyCard
                    isEditing={isEditing}
                    control={control}
                    watch={watch}
                    onEdit={() => setIsEditing(true)}
                  />
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                  <SalonWorkingHoursCard
                    isEditing={isEditing}
                    control={control}
                    watch={watch}
                    setValue={setValue}
                  />
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box component="main" className="w-full px-6 mt-4 relative">
              <button
                onClick={() => setIsEditing(true)}
                className="absolute top-6 right-10 z-10 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all text-zinc-800"
                title="Edit Profile"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                </svg>
              </button>
              <Box className="relative w-full h-[400px] rounded-[2.5rem] overflow-hidden shadow-xl border border-[#ebdcca]/20 group">
                <Box
                  component="img"
                  src={allPhotos[currentImageIndex]}
                  alt="Salon Experience"
                  className="w-full h-full object-cover transform hover:scale-[1.01] transition-transform duration-700"
                />

                {allPhotos.length > 1 && (
                  <Box sx={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
                    {allPhotos.map((_: string, idx: number) => (
                      <Box
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: currentImageIndex === idx ? '#FFB74D' : 'rgba(255, 255, 255, 0.4)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          '&:hover': { bgcolor: currentImageIndex === idx ? '#FFB74D' : 'rgba(255, 255, 255, 0.8)' }
                        }}
                      />
                    ))}
                  </Box>
                )}

                <Box className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                <Box className="absolute bottom-8 left-8 right-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pointer-events-none">
                  <Box className="flex items-center space-x-5">
                    <Box
                      component="img"
                      src={logoPhoto}
                      alt="Brand Logo"
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg bg-white"
                    />
                    <Box>
                      {salon?.type && (
                        <span className="bg-[#c29f72] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                          {salon.type}
                        </span>
                      )}
                      <h2 className="text-4xl font-black text-white tracking-tight mt-1 capitalize">{salon?.name || "Salon Name"}</h2>
                      <p className="text-sm text-zinc-300 font-medium capitalize">Under management of <span className="text-white font-bold">{salon?.owner_name || "Owner"}</span></p>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Grid container spacing={3} sx={{ mt: 3 }}>
                <Grid size={{ xs: 12, lg: 7 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ bgcolor: 'white', borderRadius: 3, p: 4, border: '1px solid', borderColor: 'var(--border-subtle)' }}>
                    <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 2, lineHeight: 1 }}>
                      ABOUT US
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.primary', mb: 4, whiteSpace: 'pre-wrap', fontWeight: 500 }}>
                      {salon?.about || "No description provided."}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, pt: 3, borderTop: '1px solid', borderColor: 'var(--border-subtle)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: 'var(--surface-muted)', borderRadius: 2 }}>
                        <Icons.Mail />
                        <Typography variant="body2" fontWeight={600} noWrap title={salon?.email}>{salon?.email || "-"}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: 'var(--surface-muted)', borderRadius: 2 }}>
                        <Icons.Phone />
                        <Typography variant="body2" fontWeight={600}>{salon?.phone ? `+91 ${salon.phone}` : "-"}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: 'var(--surface-muted)', borderRadius: 2 }}>
                        <Icons.MapPin />
                        {salon?.map_link ? (
                          <a href={salon.map_link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#2563eb', '&:hover': { textDecoration: 'underline' } }} noWrap title={salon?.address}>{salon?.address || "-"}</Typography>
                          </a>
                        ) : (
                          <Typography variant="body2" fontWeight={600} noWrap title={salon?.address} sx={{ color: '#2563eb' }}>{salon?.address || "-"}</Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ flex: 1, bgcolor: 'white', borderRadius: 3, p: 4, border: '1px solid', borderColor: 'var(--border-subtle)' }}>
                    <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 2, lineHeight: 1 }}>
                      SALON BOOKING POLICIES
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.primary', mb: 4, fontWeight: 500 }}>
                      We protect our artists schedules and resources with verified online booking policies.
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Guaranteed Policy Options:</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                          {[
                            { key: 'pay_at_venue', label: 'Pay at Venue' },
                            { key: 'partial_deposit', label: `Hold Deposit (${salon?.deposit_percentage || 0}%)` },
                            { key: 'full_upfront', label: 'Prepaid Upfront' }
                          ].map((policy) => {
                            const isActive = salon?.payment_policy === policy.key;
                            return (
                              <Box 
                                key={policy.key} 
                                sx={{ 
                                  p: 2, 
                                  borderRadius: 2, 
                                  border: '2px solid', 
                                  borderColor: isActive ? 'text.primary' : 'var(--border-subtle)', 
                                  bgcolor: isActive ? 'var(--surface-muted)' : 'transparent',
                                  opacity: isActive ? 1 : 0.4,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  textAlign: 'center',
                                  height: '100%'
                                }}
                              >
                                <Typography 
                                  variant="caption" 
                                  fontWeight={isActive ? 800 : 600} 
                                  color={isActive ? 'text.primary' : 'text.disabled'} 
                                  textTransform="uppercase"
                                >
                                  {policy.label}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary" fontWeight={600}>Late Cancellation Fee:</Typography>
                          <Typography variant="body2" fontWeight={800}>Subject to Terms</Typography>
                        </Box>
                        {salon?.cancellation_policy && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary" fontWeight={600}>Cancellation Policy:</Typography>
                            <Typography variant="body2" fontWeight={800}>{salon.cancellation_policy}</Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, lg: 5 }} sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ flex: 1, bgcolor: 'white', borderRadius: 3, p: 4, border: '1px solid', borderColor: 'var(--border-subtle)' }}>
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="subtitle1" fontWeight={800}>Operational Times</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>Verified timezone: India/Kolkata (IST)</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {schedule.map((slot) => {
                        const isOpen = slot.status === 'OPEN';
                        return (
                          <Box key={slot.day} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, borderBottom: '1px solid', borderColor: 'var(--surface-muted)', '&:last-child': { borderBottom: 'none', pb: 0 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: isOpen ? 'success.main' : 'text.disabled' }} />
                              <Typography variant="body2" fontWeight={700} color={isOpen ? 'text.primary' : 'text.secondary'}>{slot.day}</Typography>
                            </Box>
                            <Box>
                              {isOpen ? (
                                <Typography variant="body2" fontWeight={700}>{slot.openTime} - {slot.closeTime}</Typography>
                              ) : (
                                <Typography variant="caption" fontWeight={700} color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Closed</Typography>
                              )}
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Box>
    </FormProvider>
  );
};

export default MyProfile;
