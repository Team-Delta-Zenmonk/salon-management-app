import React from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import type { Control } from "react-hook-form";
import TextField from "../../../components/form/textfield";
import { shouldShowTooltip } from "../../../common/shouldShowTooltip";
import type { SalonProfileForm } from "../schema/my-profile.schema";

interface InfoFieldProps {
  label: string;
  value: string;
  name: any;
  isEditing: boolean;
  control: Control<SalonProfileForm>;
  rules?: any;
  type?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  maxLength?: number;
  pattern?: RegExp;
}

const InfoField: React.FC<InfoFieldProps> = ({
  label, value, name, rules, isEditing, control,
  type = "text", disabled = false, fullWidth = false, multiline = false, rows = 1, placeholder, maxLength, pattern
}) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: fullWidth ? "100%" : "auto" }}>
    <Typography variant="paragraphXs" color="text.secondary" sx={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5 }}>
      {label}
    </Typography>
    {isEditing ? (
      <Box sx={{ mt: 0.5 }}>
        <TextField
          name={name}
          type={type}
          control={control}
          identifier={`field-${name}`}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          rules={rules}
          disabled={disabled}
          multiline={multiline}
          rows={rows}
          maxLength={maxLength}
          pattern={pattern}
          inputPropsClassName={multiline ? "!h-auto !min-h-[40px] !bg-white" : "!bg-white"}
        />
      </Box>
    ) : multiline ? (
      <Typography
        variant="paragraphMd"
        color="text.primary"
        sx={{ fontWeight: "medium", wordBreak: "break-word", lineHeight: 1.6, mt: 1, whiteSpace: "pre-wrap" }}
      >
        {value || "-"}
      </Typography>
    ) : (
      <Tooltip title={value || "-"} disableHoverListener={!shouldShowTooltip(value || "-", "250px")}>
        <Typography
          variant="paragraphLg"
          color="text.primary"
          sx={{ fontWeight: "medium", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {value || "-"}
        </Typography>
      </Tooltip>
    )}
  </Box>
);

export default InfoField;
