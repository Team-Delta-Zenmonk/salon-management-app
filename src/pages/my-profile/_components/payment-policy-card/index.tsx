import React from "react";
import { Paper, Box, Typography, Radio, RadioGroup, FormControlLabel, FormControl, TextField, InputAdornment, IconButton } from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { Controller } from "react-hook-form";

const PaymentPolicyCard = ({ isEditing, control }: any) => {
  const options = [
    {
      value: "pay_at_venue",
      title: "Pay at Venue (No upfront payment)",
      description: "Customers can book instantly without a card. They will pay the full amount at the salon after their service. Lowest friction, but higher risk of no-shows.",
    },
    {
      value: "partial_deposit",
      title: "Require Partial Deposit",
      description: "Customers must pay a percentage of the total service cost upfront to secure their booking. The rest is paid at the salon.",
    },
    {
      value: "full_upfront",
      title: "Require Full Payment Upfront",
      description: "Customers must pay 100% of the service cost online during checkout to secure their slot. Best for protecting your time.",
    },
  ];

  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: "16px", border: "1px solid var(--border-color)", boxShadow: "none", mt: 4 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h6" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1, color: "primary.900" }}>
            <StorefrontIcon fontSize="small" /> Booking Payment Policy
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Choose how you want to charge customers when they book online through the app.
          </Typography>
        </Box>
      </Box>

      <Controller
        name="payment_policy"
        control={control}
        render={({ field }) => (
          <FormControl component="fieldset" fullWidth>
            <RadioGroup {...field} sx={{ gap: 2 }}>
              {options.map((option) => {
                const isSelected = field.value === option.value;
                const isDisabled = !isEditing && !isSelected;

                return (
                  <Paper
                    key={option.value}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: "8px",
                      borderColor: isSelected ? "primary.main" : "divider",
                      bgcolor: isSelected ? "primary.50" : "transparent",
                      transition: "all 0.2s",
                      opacity: isDisabled ? 0.4 : 1,
                      pointerEvents: isDisabled ? "none" : "auto",
                    }}
                  >
                    <FormControlLabel
                      value={option.value}
                      control={<Radio disabled={isDisabled} />}
                      label={
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "text.primary" }}>
                            {option.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {option.description}
                          </Typography>
                        </Box>
                      }
                      sx={{ m: 0, alignItems: "flex-start", width: "100%", "& .MuiRadio-root": { pt: 0.5 } }}
                    />

                    {option.value === "partial_deposit" && isSelected && (
                      <Box sx={{ mt: 2, ml: 4, display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography variant="body2" fontWeight="bold">Deposit Percentage:</Typography>
                        <Controller
                          name="deposit_percentage"
                          control={control}
                          render={({ field: depositField, fieldState }) => (
                            <TextField
                              {...depositField}
                              type="number"
                              size="small"
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                              }}
                              sx={{ width: 100, bgcolor: "background.paper" }}
                              onChange={(e) => depositField.onChange(Number(e.target.value))}
                              disabled={!isEditing}
                            />
                          )}
                        />
                      </Box>
                    )}
                  </Paper>
                );
              })}
            </RadioGroup>
          </FormControl>
        )}
      />
    </Paper>
  );
};

export default PaymentPolicyCard;