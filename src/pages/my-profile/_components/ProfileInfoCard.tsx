import React, { useState } from "react";
import { Paper } from "@mui/material";
import type { Control, UseFormSetValue, UseFormClearErrors } from "react-hook-form";
import type { SalonProfileForm } from "../schema/my-profile.schema";
import ProfileEditMode from "./ProfileEditMode";
import ProfileViewMode from "./ProfileViewMode";

interface ProfileInfoCardProps {
  isEditing: boolean;
  control: Control<SalonProfileForm>;
  salon: any;
  setValue: UseFormSetValue<SalonProfileForm>;
  clearErrors: UseFormClearErrors<SalonProfileForm>;
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ isEditing, control, salon, setValue, clearErrors }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  return (
    <Paper
      sx={{
        borderRadius: "16px",
        border: "1px solid",
        borderColor: "var(--border-color)",
        boxShadow: "none",
        overflow: "hidden",
        textAlign: "left"
      }}
    >
      {isEditing ? (
        <ProfileEditMode
          control={control}
          salon={salon}
          setValue={setValue}
          clearErrors={clearErrors}
        />
      ) : (
        <ProfileViewMode
          salon={salon}
          lightboxOpen={lightboxOpen}
          setLightboxOpen={setLightboxOpen}
          lightboxIndex={lightboxIndex}
          setLightboxIndex={setLightboxIndex}
        />
      )}
    </Paper>
  );
};

export default ProfileInfoCard;
