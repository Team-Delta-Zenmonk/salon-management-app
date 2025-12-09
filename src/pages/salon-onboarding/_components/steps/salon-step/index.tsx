import { Box } from "@mui/material";
import { useFormContext } from "react-hook-form";
import type { SalonOnboardingForm } from "../../../schema/salon-onboarding.schema";
import Select from "../../../../../components/form/select";
import { TypeOfSalon } from "../../constants/salon.type";
import FilePicker from "../../../../../components/form/file-picker";
import FileMultiPicker from "../../../../../components/form/multi-file-picker";

export default function SalonStep() {
  const { control } = useFormContext<SalonOnboardingForm>();
  const uploadLogo = async (file: File): Promise<string> => {
    // const formData = new FormData();
    // formData.append("file", file);
    // const res = await axiosInstance.post("/uploads/logo", formData, {
    //   withCredentials: true,
    // });
    // return res.data.url;
    return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9SRRmhH4X5N2e4QalcoxVbzYsD44C-sQv-w&s";
  };

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
            uploadFn={uploadLogo}
          />
        </Box>
        <Box>
          <FileMultiPicker
            name="salon.salon_images"
            control={control}
            identifier="salon-photos"
            label="Salon Photos"
            uploadFn={uploadLogo}
          />
        </Box>
      </Box>
    </Box>
  );
}
