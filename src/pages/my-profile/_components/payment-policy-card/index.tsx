import React from "react";
import { Paper, Box, Typography, Radio, RadioGroup, FormControlLabel, FormControl, TextField, InputAdornment, IconButton } from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import EditIcon from "@mui/icons-material/Edit";
import { Controller } from "react-hook-form";

const PaymentPolicyCard = ({ isEditing, control, watch, onEdit }: any) => {
  const paymentPolicy = watch("payment_policy");

  if (!isEditing) {
    return (
      <Paper sx={{ p: 3, borderRadius: "16px", border: "1px solid var(--border-color)", boxShadow: "none", mt: 4 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1, justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <StorefrontIcon fontSize="small" color="primary" /> Booking Payment Policy
          </Box>
          <IconButton size="small" onClick={onEdit} color="primary">
            <EditIcon fontSize="small" />
          </IconButton>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {paymentPolicy === "pay_at_venue" && "Pay at Venue (No upfront payment)"}
          {paymentPolicy === "partial_deposit" && `Require Partial Deposit (${watch("deposit_percentage")}%)`}
          {paymentPolicy === "full_upfront" && "Require Full Payment Upfront"}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: "16px", border: "1px solid var(--border-color)", boxShadow: "none", mt: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1, color: "primary.900" }}>
          <StorefrontIcon fontSize="small" /> Booking Payment Policy
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Choose how you want to charge customers when they book online through the app.
        </Typography>
      </Box>

      <Controller
        name="payment_policy"
        control={control}
        render={({ field }) => (
          <FormControl component="fieldset" fullWidth>
            <RadioGroup {...field} sx={{ gap: 2 }}>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: "8px", borderColor: field.value === "pay_at_venue" ? "primary.main" : "divider", bgcolor: field.value === "pay_at_venue" ? "primary.50" : "transparent", transition: "all 0.2s" }}>
                <FormControlLabel
                  value="pay_at_venue"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "text.primary" }}>Pay at Venue (No upfront payment)</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Customers can book instantly without a card. They will pay the full amount at the salon after their service. Lowest friction, but higher risk of no-shows.</Typography>
                    </Box>
                  }
                  sx={{ m: 0, alignItems: "flex-start", width: '100%', '& .MuiRadio-root': { pt: 0.5 } }}
                />
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: "8px", borderColor: field.value === "partial_deposit" ? "primary.main" : "divider", bgcolor: field.value === "partial_deposit" ? "primary.50" : "transparent", transition: "all 0.2s" }}>
                <FormControlLabel
                  value="partial_deposit"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "text.primary" }}>Require Partial Deposit</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Customers must pay a percentage of the total service cost upfront to secure their booking. The rest is paid at the salon.</Typography>
                    </Box>
                  }
                  sx={{ m: 0, alignItems: "flex-start", width: '100%', '& .MuiRadio-root': { pt: 0.5 } }}
                />

                {field.value === "partial_deposit" && (
                  <Box sx={{ mt: 2, ml: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
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
                        />
                      )}
                    />
                  </Box>
                )}
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: "8px", borderColor: field.value === "full_upfront" ? "primary.main" : "divider", bgcolor: field.value === "full_upfront" ? "primary.50" : "transparent", transition: "all 0.2s" }}>
                <FormControlLabel
                  value="full_upfront"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "text.primary" }}>Require Full Payment Upfront</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Customers must pay 100% of the service cost online during checkout to secure their slot. Best for protecting your time.</Typography>
                    </Box>
                  }
                  sx={{ m: 0, alignItems: "flex-start", width: '100%', '& .MuiRadio-root': { pt: 0.5 } }}
                />
              </Paper>

            </RadioGroup>
          </FormControl>
        )}
      />
    </Paper>
  );
};

export default PaymentPolicyCard;
