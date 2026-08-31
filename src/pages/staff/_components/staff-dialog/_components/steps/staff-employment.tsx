import type { Control } from "react-hook-form";
import type { StaffForm } from "../../../schema/staff.schema";
import TextField from "../../../../../../components/form/textfield";
import DatePicker from "../../../../../../components/form/date-picker";
import FilePicker from "../../../../../../components/form/file-picker";
import { uploadImages } from "../../../../../../features/upload-images/upload-images.service";
import { VALIDATE_PATTERN } from "../../../../../../common/validate-pattern";

export default function StaffEmployment({ control, disabled }: Readonly<{ control: Control<StaffForm>; disabled: boolean }>) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TextField
          type="text"
          label="Title"
          name="title"
          control={control}
          identifier="staff-title"
          disabled={disabled}
          pattern={VALIDATE_PATTERN.alphabet}
          maxLength={50}
          placeholder="Stylist, Barber, Receptionist, etc."
        />

        <div className="flex flex-col gap-1.5 w-full">
          <DatePicker
            name="joining_date"
            control={control}
            placeholder="Joining Date"
            identifier="staff-join"
            format="DD-MM-YYYY"
            disabled={disabled}
            label="Joining Date"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5 w-full">
          <DatePicker
            name="end_date"
            control={control}
            placeholder="End Date"
            identifier="staff-end"
            format="DD-MM-YYYY"
            disabled={disabled}
            label="End Date"
          />
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <FilePicker
            name="photos"
            control={control}
            identifier="staff-photo"
            label="Photo"
            uploadFn={uploadImages}
            disabled={disabled}
          />
        </div>
      </div>

      <TextField
        type="text"
        label="Address"
        name="address"
        control={control}
        identifier="staff-address"
        disabled={disabled}
        pattern={VALIDATE_PATTERN.alphaNumericSpecialWithSpace}
        maxLength={100}
        placeholder="Staff residential address"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TextField
          type="text"
          label="Emergency Contact Name"
          name="emergency_contact.name"
          control={control}
          identifier="staff-ec-name"
          disabled={disabled}
          pattern={VALIDATE_PATTERN.alphabet}
          maxLength={50}
          placeholder="Contact relative name"
        />

        <TextField
          type="text"
          label="Emergency Contact Phone"
          name="emergency_contact.phone"
          control={control}
          identifier="staff-ec-phone"
          disabled={disabled}
          pattern={VALIDATE_PATTERN.number}
          maxLength={10}
          placeholder="Emergency phone number"
        />
      </div>
    </div>
  );
}
