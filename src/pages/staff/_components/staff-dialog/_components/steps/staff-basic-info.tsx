import { Box, Typography } from "@mui/material";
import type { Control } from "react-hook-form";

import type { StaffForm } from "../../../schema/staff.schema";
import TextField from "../../../../../../components/form/textfield";
import DatePicker from "../../../../../../components/form/date-picker";
import Select from "../../../../../../components/form/select";
import { GenderOptions } from "../../../../../../common/enums/gender.enum";

export default function StaffBasicInformation({ control, disabled }: Readonly<{ control: Control<StaffForm>; disabled: boolean }>) {
  return (
    <Box className="flex flex-col gap-4">
      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Box className="flex flex-col gap-2">
          <Typography fontWeight="bold">First Name</Typography>
          <TextField
            type="text"
            label="First Name"
            name="first_name"
            control={control}
            identifier="staff-first"
            disabled={disabled}
          />
        </Box>

        <Box className="flex flex-col gap-2">
          <Typography fontWeight="bold">Last Name</Typography>
          <TextField
            type="text"
            label="Last Name"
            name="last_name"
            control={control}
            identifier="staff-last"
            disabled={disabled}
          />
        </Box>
      </Box>

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Box className="flex flex-col gap-2">
          <Typography fontWeight="bold">Email</Typography>
          <TextField
            type="email"
            label="Email"
            name="email"
            control={control}
            identifier="staff-email"
            disabled={disabled}
          />
        </Box>

        <Box className="flex flex-col gap-2">
          <Typography fontWeight="bold">DOB</Typography>
          <DatePicker
            name="dob"
            control={control}
            placeholder="DOB"
            identifier="staff-dob"
            format="DD-MM-YYYY"
            disableFuture
            disabled={disabled}
          />
        </Box>
      </Box>

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Box className="flex flex-col gap-2">
          <Typography fontWeight="bold">Phone</Typography>
          <TextField
            type="text"
            label="Phone Number"
            name="phone_number"
            control={control}
            identifier="staff-phone"
            disabled={disabled}
            pattern={/^\d*$/}
            maxLength={10}
          />
        </Box>

        <Box className="flex flex-col gap-2">
          <Typography fontWeight="bold">Additional Phone</Typography>
          <TextField
            type="text"
            label="Additional Phone"
            name="additional_phone_number"
            control={control}
            identifier="staff-add-phone"
            disabled={disabled}
            pattern={/^\d*$/}
            maxLength={10}
          />
        </Box>
      </Box>

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Box className="flex flex-col gap-2">
          <Typography fontWeight="bold">Gender</Typography>
          <Select
            name="gender"
            control={control}
            placeholder="Gender"
            identifier="staff-gender"
            options={GenderOptions}
            disabled={disabled}
          />
        </Box>
      </Box>
    </Box>
  );
}
