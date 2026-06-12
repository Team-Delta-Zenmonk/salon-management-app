import React from "react";
import { Box, Typography, Paper, Switch } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import type { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import TimePicker from "../../../../components/form/time-picker";
import type { SalonProfileForm } from "../../schema/my-profile.schema";
import { DAY_KEYS, DAY_LABELS } from "../constants/business-hours.constants";

interface SalonWorkingHoursCardProps {
  isEditing: boolean;
  control: Control<SalonProfileForm>;
  watch: UseFormWatch<SalonProfileForm>;
  setValue: UseFormSetValue<SalonProfileForm>;
}

const formatTime = (time: string) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const h = Number.parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  const h12Str = h12 < 10 ? `0${h12}` : `${h12}`;
  return `${h12Str}:${minutes} ${ampm}`;
};

const DayViewRow = ({ label, isOpen, dayValue }: { label: string, isOpen: boolean, dayValue: any }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: "16px",
      border: "1px solid",
      borderColor: isOpen ? "var(--secondary-100)" : "transparent",
      backgroundColor: isOpen ? "background.paper" : "var(--secondary-50)",
      opacity: isOpen ? 1 : 0.6,
      display: "flex",
      flexDirection: "column",
      gap: 1.5,
      textAlign: "left"
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: isOpen ? "success.main" : "var(--secondary-300)"
          }}
        />
        <Typography
          variant="paragraphMd"
          fontWeight="bold"
          sx={{ color: isOpen ? "text.primary" : "text.secondary" }}
        >
          {label}
        </Typography>
      </Box>
      <Box
        sx={{
          backgroundColor: isOpen ? "success.light" : "var(--secondary-100)",
          color: isOpen ? "success.dark" : "text.secondary",
          border: "1px solid",
          borderColor: isOpen ? "var(--success-200)" : "var(--secondary-200)",
          borderRadius: "6px",
          px: 1.25,
          py: 0.25,
          fontSize: "0.6875rem",
          fontWeight: "bold",
          letterSpacing: 0.5
        }}
      >
        {isOpen ? "OPEN" : "CLOSED"}
      </Box>
    </Box>

    {isOpen && dayValue?.start_time && dayValue?.end_time && (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pt: 1.25,
          borderTop: "1px solid",
          borderColor: "var(--secondary-50)"
        }}
      >
        <Typography variant="paragraphSm" color="text.secondary">
          Operational Hours
        </Typography>
        <Box
          sx={{
            backgroundColor: "var(--secondary-50)",
            border: "1px solid",
            borderColor: "var(--secondary-100)",
            borderRadius: "6px",
            px: 1.5,
            py: 0.5,
            color: "primary.900",
            fontWeight: "600",
            fontSize: "0.75rem"
          }}
        >
          {formatTime(dayValue.start_time)} – {formatTime(dayValue.end_time)}
        </Box>
      </Box>
    )}
  </Box>
);

const DayEditRow = ({ dayKey, label, isOpen, control, onToggle }: { dayKey: string, label: string, isOpen: boolean, control: Control<SalonProfileForm>, onToggle: (key: string, checked: boolean) => void }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: "12px",
      border: "1px solid",
      borderColor: "var(--secondary-100)",
      backgroundColor: "var(--secondary-50)",
      display: "flex",
      flexDirection: "column",
      gap: 1.5,
      textAlign: "left"
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Typography fontWeight="bold" color="text.primary">{label}</Typography>
      <Switch
        checked={isOpen}
        onChange={(e) => onToggle(dayKey, e.target.checked)}
        size="small"
      />
    </Box>

    {isOpen && (
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <TimePicker
            name={`business_hours.${dayKey}.start_time` as any}
            control={control}
            identifier={`${dayKey}-start`}
            placeholder="Start"
          />
        </Box>
        <Typography color="text.secondary" sx={{ mt: 1.5 }}>-</Typography>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <TimePicker
            name={`business_hours.${dayKey}.end_time` as any}
            control={control}
            identifier={`${dayKey}-end`}
            placeholder="End"
          />
        </Box>
      </Box>
    )}
  </Box>
);

const SalonWorkingHoursCard: React.FC<SalonWorkingHoursCardProps> = ({ isEditing, control, watch, setValue }) => {
  const handleToggleDay = (dayKey: string, checked: boolean) => {
    if (checked) {
      setValue(`business_hours.${dayKey}` as any, {
        start_time: "",
        end_time: ""
      });
    } else {
      setValue(`business_hours.${dayKey}` as any, null);
    }
  };

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: "16px",
        border: "1px solid",
        borderColor: "var(--border-color)",
        boxShadow: "none",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        overflow: "hidden",
        width: "100%",
        textAlign: "left"
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              p: 1.25,
              bgcolor: "primary.900",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <AccessTimeIcon sx={{ color: "common.white", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="fontWeightBold" className="text-(--primary-900) mb-2">
             Salon Working Hours
            </Typography>
            <Typography variant="paragraphXs" color="text.secondary">
              Weekly schedule slots
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {DAY_KEYS.map((dayKey) => {
          const dayValue = watch(`business_hours.${dayKey}` as any);
          const isOpen = !!dayValue;
          const label = DAY_LABELS[dayKey];

          return isEditing ? (
            <DayEditRow
              key={dayKey}
              dayKey={dayKey}
              label={label}
              isOpen={isOpen}
              control={control}
              onToggle={handleToggleDay}
            />
          ) : (
            <DayViewRow
              key={dayKey}
              label={label}
              isOpen={isOpen}
              dayValue={dayValue}
            />
          );
        })}
      </Box>
    </Paper>
  );
};

export default SalonWorkingHoursCard;
