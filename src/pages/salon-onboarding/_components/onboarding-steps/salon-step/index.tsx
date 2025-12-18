import { Box } from "@mui/material";
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
    <Box className="space-y-6">
      <Box>
        <Box className="text-lg font-semibold mb-2">Salon Details</Box>
        <Box className="text-sm text-gray-500">Add details to help customers recognize your salon.</Box>
      </Box>
      <Box className="space-y-6">
        <Box>
          <Select
            name="salon.type"
            control={control}
            placeholder="Salon Type"
            identifier="salon-type"
            options={TypeOfSalon}
          />
        </Box>
        <Box>
          <FilePicker
            name="salon.logo"
            control={control}
            identifier="salon-logo"
            label="Salon Logo"
            uploadFn={uploadImages}
          />
        </Box>
        <Box>
          <FileMultiPicker
            name="salon.photos"
            control={control}
            identifier="salon-photos"
            label="Salon Photos"
            uploadFn={uploadImages}
          />
        </Box>
      </Box>
    </Box>
  );
}
