import { useFormContext } from "react-hook-form";
import type { SalonOnboardingForm } from "../../../schema/salon-onboarding.schema";
import Select from "../../../../../components/form/select";
import { TypeOfSalon } from "../../constants/salon.type";
import FilePicker from "../../../../../components/form/file-picker";
import FileMultiPicker from "../../../../../components/form/multi-file-picker";
import { uploadImages } from "../../../../../features/upload-images/upload-images.service";
import { ALLOWED_IMAGE_TYPES } from "../../../../../features/upload-images/upload-images.utils";
import SlugInput from "./_components/slug-input";

export default function SalonStep() {
  const { control } = useFormContext<SalonOnboardingForm>();
  return (
    <div className="space-y-6 pt-2">
        <div>
          <SlugInput />
        </div>
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
            accept="image/jpeg,image/png,image/webp"
            allowedTypes={ALLOWED_IMAGE_TYPES}
            uploadFn={uploadImages}
          />
        </div>
        <div>
          <FileMultiPicker
            name="salon.photos"
            control={control}
            identifier="salon-photos"
            label="Salon Photos"
            accept="image/jpeg,image/png,image/webp"
            allowedTypes={ALLOWED_IMAGE_TYPES}
            uploadFn={uploadImages}
            maxFiles={4}
          />
        </div>
      </div>
  );
}
