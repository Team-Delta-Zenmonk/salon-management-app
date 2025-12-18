import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Switch,
} from "@mui/material";
import clsx from "clsx";
import { FormProvider, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../../store/hooks";
import { callSnack } from "../../../../components/snackbar";
import styles from "./staff-dialog.module.scss";
import { StaffSchema, type StaffForm } from "../schema/staff.schema";
import FilePicker from "../../../../components/form/file-picker";
import { uploadImages } from "../../../../features/upload-images/upload-images.service";
import TextField from "../../../../components/form/textfield";
import Select from "../../../../components/form/select";
import { createStaffService } from "../../../../features/staff/create-staff/create-staff.service";
import { updateStaffAction } from "../../../../features/staff/update-staff/update-staff.action";
import DatePicker from "../../../../components/form/date-picker";
import DateTimePicker from "../../../../components/form/time-picker";
import { GenderOptions } from "../../../../common/enums/gender.enum";
import { listStaffAction } from "../../../../features/staff/list-staff/list-staff.action";
import { DaysList, type DayKey } from "../../../../common/enums/days.enum";

interface StaffDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "update";
  staff?: any;
}

export default function StaffDialog({ open, onClose, mode, staff }: StaffDialogProps) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<StaffForm>({
    resolver: zodResolver(StaffSchema),
  });

  const { handleSubmit, control, reset, watch, setValue } = methods;

  const activeHours = watch("active_hours");

  const setDayClosed = (day: DayKey, closed: boolean) => {
    if (closed) {
      setValue(`active_hours.${day}` as any, null);
      return;
    }
    setValue(`active_hours.${day}` as any, {
      start_time: "",
      end_time: "",
    });
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);
      console.log("data", data);
      const photos = data.photos || (mode === "update" ? staff?.photos : undefined);
      const payload = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number,
        additional_phone_number: data?.additional_phone_number ?? null,
        dob: data.dob,
        title: data.title,
        joining_date: data.joining_date,
        end_date: data.end_date?.trim() ? data.end_date : undefined,
        address: data.address,
        emergency_contact: data.emergency_contact,
        gender: data.gender,
        photos: photos,
        active_hours: data.active_hours ?? null,
      };

      if (mode === "create") {
        console.log("payload", payload);
        await createStaffService(payload);
        await dispatch(listStaffAction({ page: 1, limit: 50 }));
        callSnack("Staff created successfully", "success");
      } else if (mode === "update" && staff?.uuid) {
        console.log("payload update ", payload);
        console.log("payload in update: ", payload);
        await dispatch(updateStaffAction({ uuid: staff.uuid, body: payload })).unwrap();
        await dispatch(listStaffAction({ page: 1, limit: 10 }));
        callSnack("Staff updated successfully", "success");
      }
      onClose();
    } catch (err) {
      callSnack(mode === "create" ? "Staff Creation Failed" : "Staff Update Failed", "error");
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    if (!open) return;

    if (mode === "create") {
      reset();
      return;
    }

    if (mode === "update" && staff) {
      reset({
        first_name: staff.first_name ?? "",
        last_name: staff.last_name ?? "",
        email: staff.email ?? "",
        phone_number: staff.phone_number ?? "",
        additional_phone_number: staff.additional_phone_number ?? "",
        dob: staff.dob ?? "",
        title: staff.title ?? "",
        joining_date: staff.joining_date ?? "",
        end_date: staff.end_date ?? undefined,
        address: staff.address ?? "",
        emergency_contact: staff.emergency_contact ?? { name: "", phone: "" },
        gender: staff.gender,
        photos: null,
        active_hours: staff.active_hours ?? {
          monday: null,
          tuesday: null,
          wednesday: null,
          thursday: null,
          friday: null,
          saturday: null,
          sunday: null,
        },
      });
    }
  }, [open, mode, staff, reset]);

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (isLoading && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
        onClose();
      }}
      className={styles.dialogContainer}
      classes={{ paper: styles.dialog }}
    >
      <DialogTitle className={clsx(styles.dialogTitle)} fontWeight="fontWeightMedium" variant="h5">
        {mode === "create" ? "Create Staff" : "Update Staff"}
      </DialogTitle>

      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <DialogContent className={clsx("flex flex-col gap-4 py-1 px-3", styles.dialogContent)}>
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Box className="flex flex-col gap-2">
                <Typography fontWeight="bold">First Name</Typography>
                <TextField
                  type="text"
                  label="First Name"
                  name="first_name"
                  control={control}
                  identifier="staff-first-name"
                  disabled={isLoading}
                />
              </Box>
              <Box className="flex flex-col gap-2">
                <Typography fontWeight="bold">Last Name</Typography>
                <TextField
                  type="text"
                  label="First Name"
                  name="last_name"
                  control={control}
                  identifier="staff-last-name"
                  disabled={isLoading}
                />
              </Box>

              <Box className="flex flex-col gap-2">
                <Typography fontWeight="bold">Email</Typography>
                <TextField
                  type="email"
                  label="Email"
                  name="email"
                  control={control}
                  identifier="staff-email"
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </Box>
              <Box className="flex flex-col gap-2">
                <Typography fontWeight="bold">Additional Phone Number</Typography>
                <TextField
                  type="text"
                  label="Additionl Phone"
                  name="additional_phone_number"
                  control={control}
                  identifier="staff-additional-phone-number"
                  disabled={isLoading}
                />
              </Box>
            </Box>

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Box className="flex flex-col gap-2">
                <Typography fontWeight="bold">Joining Date</Typography>
                <DatePicker
                  name="joining_date"
                  control={control}
                  placeholder="Joining Date"
                  identifier="staff-joining-date"
                  format="DD-MM-YYYY"
                  disabled={isLoading}
                />
              </Box>
              <Box className="flex flex-col gap-2">
                <Typography fontWeight="bold">End Date</Typography>
                <DatePicker
                  name="end_date"
                  control={control}
                  placeholder="End Date"
                  identifier="staff-end-date"
                  format="DD-MM-YYYY"
                  disabled={isLoading}
                />
              </Box>
            </Box>

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Box className="flex flex-col gap-2">
                <Typography fontWeight="bold">Title</Typography>
                <TextField
                  type="text"
                  label="Title"
                  name="title"
                  control={control}
                  identifier="staff-title"
                  disabled={isLoading}
                />
              </Box>
              <Box className="flex flex-col gap-2">
                <Typography fontWeight="bold">Gender</Typography>
                <Select
                  name="gender"
                  control={control}
                  placeholder="Gender"
                  identifier="staff-gender"
                  options={GenderOptions}
                  disabled={isLoading}
                />
              </Box>
            </Box>

            <Box className="flex flex-col gap-2">
              <Typography fontWeight="bold">Photo (optional)</Typography>
              <FilePicker
                name="photos"
                control={control}
                identifier="staff-photo"
                label="Photo (optional)"
                uploadFn={uploadImages}
                disabled={isLoading}
              />
            </Box>

            <Box className="flex flex-col gap-2">
              <Typography fontWeight="bold">Address</Typography>
              <TextField
                type="text"
                label="Address"
                name="address"
                control={control}
                identifier="staff-address"
                disabled={isLoading}
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
                  identifier="staff-emergency-name"
                  disabled={isLoading}
                />
              </Box>

              <Box className="flex flex-col gap-2">
                <Typography fontWeight="bold">Emergency Contact Phone</Typography>
                <TextField
                  type="text"
                  label="Phone"
                  name="emergency_contact.phone"
                  control={control}
                  identifier="staff-emergency-phone"
                  disabled={isLoading}
                />
              </Box>
            </Box>

            <Box className="flex flex-col gap-2">
              <Typography fontWeight="bold">Active Hours</Typography>
              <Box className="flex flex-col gap-3">
                {DaysList.map((day) => {
                  const val = (activeHours as any)?.[day];
                  const isClosed = val === null;

                  return (
                    <Box key={day} className="border border-gray-200 rounded-lg p-3 space-y-3">
                      <Box className="flex items-center justify-between">
                        <Typography fontWeight="bold" className="capitalize">
                          {day}
                        </Typography>

                        <FormControlLabel
                          control={
                            <Switch
                              checked={isClosed}
                              onChange={(e) => setDayClosed(day, e.target.checked)}
                              disabled={isLoading}
                            />
                          }
                          label="Closed"
                        />
                      </Box>

                      {!isClosed && (
                        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Box className="flex flex-col gap-2">
                            <Typography fontWeight="bold">Start Time</Typography>
                            <DateTimePicker
                              name={`active_hours.${day}.start_time` as any}
                              control={control}
                              placeholder="Start Time"
                              identifier={`staff-${day}-start`}
                              disabled={isLoading}
                            />
                          </Box>

                          <Box className="flex flex-col gap-2">
                            <Typography fontWeight="bold">End Time</Typography>
                            <DateTimePicker
                              name={`active_hours.${day}.end_time` as any}
                              control={control}
                              placeholder="End Time"
                              identifier={`staff-${day}-end`}
                              disabled={isLoading}
                            />
                          </Box>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </DialogContent>

          <DialogActions className={clsx(styles.dialogActions, "px-2 py-1 pb-2")}>
            <Button onClick={onClose} disabled={isLoading}>
              Back
            </Button>
            <Button type="submit" disabled={isLoading}>
              {mode === "create" ? "Create" : "Save"}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
}
