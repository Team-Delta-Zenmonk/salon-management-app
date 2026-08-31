import { useFormContext } from "react-hook-form";
import TextField from "../../../../../components/form/textfield";
import type { SalonOnboardingForm } from "../../../schema/salon-onboarding.schema";
import { VALIDATE_PATTERN } from "../../../../../common/validate-pattern";

export default function OwnerStep() {
  const { control } = useFormContext<SalonOnboardingForm>();

  return (
    <div className="space-y-4 pt-2">
      <TextField
        type="text"
        label="Owner Name"
        name="owner.owner_name"
        control={control}
        identifier="owner-name"
        placeholder="Enter owner name"
        pattern={VALIDATE_PATTERN.alphabet}
      />
    </div>
  );
}
