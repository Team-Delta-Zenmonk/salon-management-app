import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import type { Control, UseFormSetValue, UseFormClearErrors } from "react-hook-form";
import FilePicker from "../../../../components/form/file-picker";
import FileMultiPicker from "../../../../components/form/multi-file-picker";
import LocationMap from "../../../../components/map";
import { TypeOfSalon } from "../constants/salon.constants";
import { uploadImages } from "../../../../features/upload-images/upload-images.service";
import { VALIDATE_PATTERN } from "../../../../common/validate-pattern";
import type { SalonProfileForm } from "../../schema/my-profile.schema";
import InfoField from "../info-field";
import Select from "../../../../components/form/select";

interface ProfileEditModeProps {
  control: Control<SalonProfileForm>;
  salon: any;
  setValue: UseFormSetValue<SalonProfileForm>;
  clearErrors: UseFormClearErrors<SalonProfileForm>;
}

const ProfileEditMode: React.FC<ProfileEditModeProps> = ({
  control,
  salon,
  setValue,
  clearErrors
}) => {
  return (
    <>
      <Box sx={{ bgcolor: "primary.main", p: 3, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h5" color="common.white" fontWeight="bold">
          Edit Salon Details
        </Typography>
      </Box>
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3, overflow: "visible" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, pb: 1 }}>
          <FilePicker
            name="logo"
            control={control}
            identifier="salon-logo-edit"
            label="Edit Salon Logo"
            uploadFn={uploadImages}
          />
          <FileMultiPicker
            name="photos"
            control={control}
            identifier="salon-photos-edit"
            label="Edit Salon Photos"
            uploadFn={uploadImages}
          />
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoField
              label="Salon Name"
              value={salon?.name || ""}
              name="name"
              isEditing={true}
              control={control}
              maxLength={30}
              pattern={VALIDATE_PATTERN.alphabet}
              rules={{ required: "Salon name is required" } as any}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoField
              label="Owner Name"
              value={salon?.owner_name || ""}
              name="owner_name"
              isEditing={true}
              control={control}
              maxLength={30}
              pattern={VALIDATE_PATTERN.alphabet}
              rules={{ required: "Owner name is required" } as any}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoField
              label="Registered Email"
              value={salon?.email || ""}
              name="email"
              isEditing={true}
              control={control}
              disabled={true}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoField
              label="Contact Number"
              value={salon?.phone || ""}
              name="phone"
              isEditing={true}
              control={control}
              maxLength={10}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="paragraphXs" color="text.secondary" sx={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Salon Type
              </Typography>
              <Select
                name="type"
                control={control}
                identifier="salon-type-select"
                options={TypeOfSalon}
                placeholder="Select Salon Type"
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <InfoField
              label="Address"
              value={salon?.address || ""}
              name="address.address"
              isEditing={true}
              control={control}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <InfoField
              label="Google Map Link"
              value={salon?.map_link || ""}
              name="address.map_link"
              isEditing={true}
              control={control}
              fullWidth
            />
          </Grid>
        </Grid>

        <Box sx={{ pt: 1, pb: 2 }}>
          <Typography variant="paragraphXs" color="text.secondary" sx={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5, mb: 1, display: "block" }}>
            Update Location on Map
          </Typography>
          <LocationMap
            control={control}
            latitude="address.latitude"
            longitude="address.longitude"
            setValue={setValue as any}
            clearErrors={clearErrors as any}
          />
        </Box>

        <Grid size={{ xs: 12 }}>
          <InfoField
            label="About"
            value={salon?.about || ""}
            name="about"
            isEditing={true}
            control={control}
            multiline
            rows={4}
            fullWidth
            maxLength={100}
            placeholder="Tell us about your salon"
          />
        </Grid>
      </Box>
    </>
  );
};

export default ProfileEditMode;
