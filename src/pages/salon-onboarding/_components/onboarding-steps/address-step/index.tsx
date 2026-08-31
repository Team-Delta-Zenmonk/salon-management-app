import { useFormContext } from "react-hook-form";
import type { SalonOnboardingForm } from "../../../schema/salon-onboarding.schema";
import TextField from "../../../../../components/form/textfield";
import LocationMap from "../../../../../components/map";

export default function AddressStep() {
  const { control, setValue, clearErrors } = useFormContext<SalonOnboardingForm>();

  return (
    <div className="space-y-4 pt-2">
      <div>
        <TextField
          type="text"
          label="Full Address"
          name="address.address"
          control={control}
          identifier="salon-address"
          placeholder="Enter full address"
        />
      </div>
      <div>
        <TextField
          type="text"
          label="Map Link"
          name="address.map_link"
          control={control}
          identifier="salon-map-link"
          placeholder="Google Maps link"
        />
      </div>
      <div>
        <LocationMap
          control={control}
          latitude="address.latitude"
          longitude="address.longitude"
          label="Select location on map"
          setValue={setValue}
          clearErrors={clearErrors}
        />
      </div>
    </div>
  );
}
