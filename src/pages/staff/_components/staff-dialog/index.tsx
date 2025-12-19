import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from "@mui/material";
import clsx from "clsx";
import { FormProvider, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../../store/hooks";
import { callSnack } from "../../../../components/snackbar";
import styles from "./staff-dialog.module.scss";
import { createStaffService } from "../../../../features/staff/create-staff/create-staff.service";
import { updateStaffAction } from "../../../../features/staff/update-staff/update-staff.action";
import { listStaffAction } from "../../../../features/staff/list-staff/list-staff.action";
import { StaffSchema, type StaffForm } from "../schema/staff.schema";
import { createStaffDefaultPayload, updateStaffDefaultPayload } from "./_components/utils/default-payload";
import StepperHeader from "../../../../components/stepper";
import StaffBasicInformation from "./_components/steps/staff-basic-info";
import StaffInformation from "./_components/steps/staff-employment";
import StaffSchedule from "./_components/steps/staff-schedule";

type Props = {
  open: boolean;
  onClose: () => void;
  mode: "create" | "update";
  staff?: any;
};

const STEPS = [{ label: "Basic" }, { label: "Employment" }, { label: "Hours" }];

const STEP_FIELDS: Record<number, Array<keyof any>> = {
  0: ["first_name", "last_name", "email", "dob", "phone_number", "additional_phone_number", "gender"],
  1: ["title", "joining_date", "end_date", "address", "photos", "emergency_contact.name", "emergency_contact.phone"],
  2: ["active_hours"],
};

export default function StaffDialog({ open, onClose, mode, staff }: Props) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);

  const methods = useForm<StaffForm>({
    resolver: zodResolver(StaffSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: createStaffDefaultPayload(),
  });

  const { handleSubmit, control, reset, watch, setValue, trigger } = methods;

  const close = () => {
    if (isLoading) return;
    onClose();
  };

  const back = () => {
    if (step === 0) close();
    else setStep((s) => s - 1);
  };

  const next = async () => {
    const fields = STEP_FIELDS[step] ?? [];
    if (fields.length > 0) {
      const ok = await trigger(fields as any, { shouldFocus: true });
      if (!ok) return;
    }
    setStep((s) => Math.min(s + 1, 2));
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);

      const photos = data.photos || (mode === "update" ? staff?.photos : undefined);

      const payload = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number,
        additional_phone_number: data.additional_phone_number ?? null,
        dob: data.dob,
        title: data.title,
        joining_date: data.joining_date,
        end_date: data.end_date?.trim() ? data.end_date : undefined,
        address: data.address,
        emergency_contact: data.emergency_contact,
        gender: data.gender,
        photos,
        active_hours: data.active_hours ?? null,
      };

      if (mode === "create") {
        await createStaffService(payload);
        await dispatch(listStaffAction({ page: 1, limit: 10 }));
        callSnack("Staff created successfully", "success");
      } else {
        await dispatch(updateStaffAction({ uuid: staff.uuid, body: payload })).unwrap();
        callSnack("Staff updated successfully", "success");
      }

      onClose();
    } catch (err: any) {
      callSnack(err?.response?.data?.message || "Action failed", "error");
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    if (!open) return;
    setStep(0);

    if (mode === "create") {
      reset(createStaffDefaultPayload());
      return;
    }

    if (mode === "update" && staff) {
      reset(updateStaffDefaultPayload(staff));
    }
  }, [open, mode, staff, reset]);

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (isLoading && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
        close();
      }}
      fullWidth
      maxWidth="md"
      classes={{ paper: styles.dialog }}
    >
      <DialogTitle fontWeight="fontWeightMedium" variant="h5">
        {mode === "create" ? "Create Staff" : "Update Staff"}
      </DialogTitle>

      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <StepperHeader steps={STEPS} activeStep={step} />

          <DialogContent className={clsx(styles.dialogContent)}>
            <Box className="px-4 py-4">
              {step === 0 && <StaffBasicInformation control={control} disabled={isLoading} />}
              {step === 1 && <StaffInformation control={control} disabled={isLoading} />}
              {step === 2 && <StaffSchedule control={control} watch={watch} setValue={setValue} disabled={isLoading} />}
            </Box>
          </DialogContent>

          <DialogActions className={styles.dialogActions}>
            <Button type="button" onClick={back} disabled={isLoading}>
              {step === 0 ? "Cancel" : "Back"}
            </Button>

            {step < 2 ? (
              <Button type="button" variant="contained" onClick={next} disabled={isLoading}>
                Next
              </Button>
            ) : (
              <Button type="button" variant="contained" onClick={() => onSubmit()} disabled={isLoading}>
                {mode === "create" ? "Create" : "Save"}
              </Button>
            )}
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
}
