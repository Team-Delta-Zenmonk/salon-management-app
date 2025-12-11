import { Box } from "@mui/material";
import { useFormContext } from "react-hook-form";
import TextField from "../../../../../components/form/textfield";
import type { SalonOnboardingForm } from "../../../schema/salon-onboarding.schema";
import { VALIDATE_PATTERN } from "../../../../../common/validate-pattern";

export default function OwnerStep() {
  const { control } = useFormContext<SalonOnboardingForm>();

  return (
    <Box className="space-y-4">
      <Box>
        <Box className="text-lg font-semibold mb-2">Owner Details</Box>
        <Box className="text-sm text-gray-500">Tell us who owns this salon.</Box>
      </Box>
      <TextField
        type="text"
        label="Owner Name"
        name="owner.owner_name"
        control={control}
        identifier="owner-name"
        pattern={VALIDATE_PATTERN.alphabet}
      />
    </Box>
  );
}
