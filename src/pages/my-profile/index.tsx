import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Box, Grid, CircularProgress, Typography, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import type { RootState } from "../../store/store";
import { getSalonProfileAction } from "../../features/auth/profile/get-salon-profile/getSalonProfile.action";
import { updateSalonProfileAction } from "../../features/auth/profile/update-salon-profile/update-salon-profile.action";
import { callSnack } from "../../components/snackbar";
import { zodResolver } from "@hookform/resolvers/zod";
import ProfileInfoCard from "./_components/profile-info-card";
import SalonWorkingHoursCard from "./_components/salon-working-hours-card";
import { MyProfileSchema, type SalonProfileForm } from "./schema/my-profile.schema";
import { DAYS_MAP } from "./_components/constants/business-hours.constants";
import styles from "./my-profile.module.scss";


const MyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
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
      business_hours: getMappedInitialHours()
    }
  });

  const { control, handleSubmit, reset, setValue, clearErrors, watch } = methods;

  const onSubmit = async (data: SalonProfileForm) => {
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

  return (
    <FormProvider {...methods}>
      <Box className="flex flex-col gap-8 pb-12">
        <Box className={styles.stickyHeader}>
          <Box>
            <Typography variant="h5" fontWeight="fontWeightBold" className="text-(--primary-900) mb-2">
              My Profile
            </Typography>
            <Typography variant="paragraphMd" color="text.secondary">
              View and manage your salon's business information.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5 }}>
            {isEditing ? (
              <>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon sx={{ color: "primary.main" }} />}
                  onClick={handleCancel}
                  sx={{ borderRadius: "8px", borderColor: "var(--border-color)", color: "text.secondary", "&:hover": { bgcolor: "var(--secondary-50)" }, whiteSpace: "nowrap", px: 3, py: 1.25 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon sx={{ color: "common.white" }} />}
                  onClick={handleSubmit(onSubmit, (errors) => console.log("Form Errors:", errors))}
                  sx={{ borderRadius: "8px", px: 3, py: 1.25, boxShadow: "none", whiteSpace: "nowrap" }}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                startIcon={<EditIcon sx={{ color: "common.white" }} />}
                onClick={() => setIsEditing(true)}
                sx={{ borderRadius: "8px", px: 3, py: 1.25, boxShadow: "none", whiteSpace: "nowrap" }}
              >
                EDIT PROFILE
              </Button>
            )}
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
    </FormProvider>
  );
};

export default MyProfile;
