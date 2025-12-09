import { Box } from "@mui/material";
import { useFormContext } from "react-hook-form";
import type { SalonOnboardingForm } from "../../../schema/salon-onboarding.schema";
import TextField from "../../../../../components/form/textfield";
import LocationMap from "../../../../../components/map/map-picker";

export default function AddressStep() {
  const { control, setValue, clearErrors } = useFormContext<SalonOnboardingForm>();

  return (
    <Box className="space-y-4">
      <Box>
        <Box className="text-lg font-semibold mb-2">Address</Box>
        <Box className="text-sm text-gray-500">Where can customers find your salon?</Box>
      </Box>
      <Box>
        <TextField
          type="text"
          label="Full Address"
          name="address.address"
          control={control}
          identifier="salon-address"
        />
      </Box>
      <Box>
        <TextField
          type="text"
          label="Maps Link"
          name="address.map_link"
          control={control}
          identifier="salon-map-link"
        />
      </Box>
      <Box>
        <LocationMap
          control={control}
          latitude="address.latitude"
          longitude="address.longitude"
          label="Select location on map"
          setValue={setValue}
          clearErrors={clearErrors}
        />
      </Box>
    </Box>
  );
}
