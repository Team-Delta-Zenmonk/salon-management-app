import { Box, Typography } from "@mui/material";
import type { Control } from "react-hook-form";
import type { StaffForm } from "../../../schema/staff.schema";
import TextField from "../../../../../../components/form/textfield";
import DatePicker from "../../../../../../components/form/date-picker";
import FilePicker from "../../../../../../components/form/file-picker";
import { uploadImages } from "../../../../../../features/upload-images/upload-images.service";

export default function StaffEmployment({ control, disabled }: { control: Control<StaffForm>; disabled: boolean }) {
  return (
    <Box className="flex flex-col gap-4">
      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Box className="flex flex-col gap-2">
          <Typography fontWeight="bold">Title</Typography>
          <TextField
            type="text"
            label="Title"
            name="title"
            control={control}
            identifier="staff-title"
            disabled={disabled}
          />
        </Box>

        <Box className="flex flex-col gap-2">
          <Typography fontWeight="bold">Joining Date</Typography>
          <DatePicker
            name="joining_date"
            control={control}
            placeholder="Joining Date"
            identifier="staff-join"
            format="DD-MM-YYYY"
            disabled={disabled}
          />
        </Box>
      </Box>

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Box className="flex flex-col gap-2">
          <Typography fontWeight="bold">End Date</Typography>
          <DatePicker
            name="end_date"
            control={control}
            placeholder="End Date"
            identifier="staff-end"
            format="DD-MM-YYYY"
            disabled={disabled}
          />
        </Box>

        <Box className="flex flex-col gap-2">
          <Typography fontWeight="bold">Photo</Typography>
          <FilePicker
            name="photos"
            control={control}
            identifier="staff-photo"
            label="Photo (optional)"
            uploadFn={uploadImages}
            disabled={disabled}
          />
        </Box>
      </Box>

      <Box className="flex flex-col gap-2">
        <Typography fontWeight="bold">Address</Typography>
        <TextField
          type="text"
          label="Address"
          name="address"
          control={control}
          identifier="staff-address"
          disabled={disabled}
        />
      </Box>

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Box className="flex flex-col gap-2">
          <Typography fontWeight="bold">Emergency Contact Name</Typography>
          <TextField
            type="text"
            label="Name"
            name="emergency_contact.name"
            control={control}
            identifier="staff-ec-name"
            disabled={disabled}
          />
        </Box>

        <Box className="flex flex-col gap-2">
          <Typography fontWeight="bold">Emergency Contact Phone</Typography>
          <TextField
            type="text"
            label="Phone"
            name="emergency_contact.phone"
            control={control}
            identifier="staff-ec-phone"
            disabled={disabled}
          />
        </Box>
      </Box>
    </Box>
  );
}
