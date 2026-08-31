import type { Control } from "react-hook-form";
import type { StaffForm } from "../../../schema/staff.schema";
import TextField from "../../../../../../components/form/textfield";
import DatePicker from "../../../../../../components/form/date-picker";
import Select from "../../../../../../components/form/select";
import { GenderOptions } from "../../../../../../common/enums/gender.enum";
import { VALIDATE_PATTERN } from "../../../../../../common/validate-pattern";

export default function StaffBasicInformation({ control, disabled }: Readonly<{ control: Control<StaffForm>; disabled: boolean }>) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TextField
          type="text"
          label="First Name"
          name="first_name"
          control={control}
          identifier="staff-first"
          disabled={disabled}
          pattern={VALIDATE_PATTERN.alphabet}
          maxLength={50}
          placeholder="First name"
        />

        <TextField
          type="text"
          label="Last Name"
          name="last_name"
          control={control}
          identifier="staff-last"
          disabled={disabled}
          pattern={VALIDATE_PATTERN.alphabet}
          maxLength={50}
          placeholder="Last name"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TextField
          type="email"
          label="Email"
          name="email"
          control={control}
          identifier="staff-email"
          disabled={disabled}
          maxLength={50}
          placeholder="Email address"
        />

        <div className="flex flex-col gap-1.5 w-full">
          <DatePicker
            name="dob"
            control={control}
            placeholder="DOB"
            identifier="staff-dob"
            format="DD-MM-YYYY"
            disableFuture
            disabled={disabled}
            label="DOB"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TextField
          type="text"
          label="Phone"
          name="phone_number"
          control={control}
          identifier="staff-phone"
          disabled={disabled}
          pattern={VALIDATE_PATTERN.number}
          maxLength={10}
          placeholder="10-digit mobile number"
        />

        <TextField
          type="text"
          label="Additional Phone"
          name="additional_phone_number"
          control={control}
          identifier="staff-add-phone"
          disabled={disabled}
          pattern={/^\d*$/}
          maxLength={10}
          placeholder="Secondary phone (optional)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Select
          name="gender"
          control={control}
          placeholder="Gender"
          identifier="staff-gender"
          options={GenderOptions}
          disabled={disabled}
          label="Gender"
        />
      </div>
    </div>
  );
}
