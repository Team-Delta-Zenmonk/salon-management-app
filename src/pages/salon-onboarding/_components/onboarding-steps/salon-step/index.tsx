import { useFormContext } from "react-hook-form";
import type { SalonOnboardingForm } from "../../../schema/salon-onboarding.schema";
import Select from "../../../../../components/form/select";
import { TypeOfSalon } from "../../constants/salon.type";
import FilePicker from "../../../../../components/form/file-picker";
import FileMultiPicker from "../../../../../components/form/multi-file-picker";
import { uploadImages } from "../../../../../features/upload-images/upload-images.service";

export default function SalonStep() {
  const { control } = useFormContext<SalonOnboardingForm>();
  return (
    <div className="space-y-6 pt-2">
        <div>
          <Select
            name="salon.type"
            control={control}
            placeholder="Salon Type"
            identifier="salon-type"
            options={TypeOfSalon}
          />
        </div>
        <div>
          <FilePicker
            name="salon.logo"
            control={control}
            identifier="salon-logo"
            label="Salon Logo"
            uploadFn={uploadImages}
          />
        </div>
        <div>
          <FileMultiPicker
            name="salon.photos"
            control={control}
            identifier="salon-photos"
            label="Salon Photos"
            uploadFn={uploadImages}
          />
        </div>
      </div>
  );
}
