import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, type FieldPath } from "react-hook-form";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../../store/hooks";
import { callSnack } from "../../../../components/snackbar";
import { createStaffService } from "../../../../features/staff/create-staff/create-staff.service";
import { updateStaffAction } from "../../../../features/staff/update-staff/update-staff.action";
import { listStaffAction } from "../../../../features/staff/list-staff/list-staff.action";
import { StaffSchema, type StaffForm } from "../schema/staff.schema";
import { createStaffDefaultPayload, updateStaffDefaultPayload } from "./_components/utils/default-payload";
import StaffBasicInformation from "./_components/steps/staff-basic-info";
import StaffEmployment from "./_components/steps/staff-employment";
import StaffSchedule from "./_components/steps/staff-schedule";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Loader2, Check, ArrowRight, ArrowLeft, User, Briefcase, CalendarClock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Staff } from "../../../../features/staff/staff.slice";

type Props = {
  open: boolean;
  onClose: () => void;
  mode: "create" | "update";
  staff?: Staff;
};

const STEPS = [
  { label: "Basic Info", desc: "Personal details", icon: User },
  { label: "Employment", desc: "Role & contact", icon: Briefcase },
  { label: "Work Hours", desc: "Weekly schedule", icon: CalendarClock },
];

const STEP_FIELDS: Record<number, FieldPath<StaffForm>[]> = {
  0: ["first_name", "last_name", "email", "dob", "phone_number", "additional_phone_number", "gender"],
  1: ["title", "joining_date", "end_date", "address", "photos", "emergency_contact.name" as FieldPath<StaffForm>, "emergency_contact.phone" as FieldPath<StaffForm>],
  2: ["active_hours"],
};

export default function StaffDialog({ open, onClose, mode, staff }: Readonly<Props>) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);

  const methods = useForm<StaffForm>({
    resolver: zodResolver(StaffSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: createStaffDefaultPayload(),
  });

  const { handleSubmit, control, reset, watch, setValue, trigger, formState: { errors } } = methods;

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
      const ok = await trigger(fields, { shouldFocus: true });
      if (!ok) return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);
      const photos = data.photos || (mode === "update" ? staff?.photos : undefined);

      const payload = {
        first_name: data.first_name?.trim().toLowerCase(),
        last_name: data.last_name ? data.last_name.trim().toLowerCase() : undefined,
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
        await dispatch(listStaffAction({ page: 1, limit: 1000 }));
        callSnack("Staff created successfully", "success");
      } else {
        await dispatch(updateStaffAction({ uuid: staff!.uuid, body: payload })).unwrap();
        callSnack("Staff updated successfully", "success");
      }

      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      callSnack(error?.response?.data?.message || "Action failed", "error");
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    const subscription = watch((_, { name }) => {
      if (name) {
        const keys = name.split(".");
        let hasError: unknown = errors;
        for (const k of keys) {
          hasError = (hasError as Record<string, unknown>)?.[k];
          if (!hasError) break;
        }
        if (hasError) trigger(name as FieldPath<StaffForm>);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, trigger, errors]);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    if (mode === "create") {
      reset(createStaffDefaultPayload());
    } else if (mode === "update" && staff) {
      reset(updateStaffDefaultPayload(staff));
    }
  }, [open, mode, staff, reset]);

  const totalSteps = STEPS.length;
  const progressPercent = (step / (totalSteps - 1)) * 100;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          if (isLoading) return;
          close();
        }
      }}
    >
      <DialogContent className="sm:max-w-[680px] w-full max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        {/* ── Header ── */}
        <DialogHeader className="px-6 py-5 border-b border-border/40 bg-muted/20 shrink-0">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {mode === "create" ? "Add Staff Member" : "Update Staff Profile"}
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            {mode === "create"
              ? "Fill in the details across all steps to create a new staff profile."
              : "Update the information across the steps below."}
          </p>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">

            {/* ── Stepper ── */}
            <div className="shrink-0 px-6 pt-5 pb-6 border-b border-border/30 select-none">
              {/* Step bubbles */}
              <div className="relative flex items-start justify-between">
                {/* Track line */}
                <div className="absolute left-0 right-0 top-[18px] h-[2px] bg-border/40 mx-9 z-0" />
                {/* Progress fill */}
                <motion.div
                  className="absolute top-[18px] h-[2px] bg-primary z-0 ml-9"
                  initial={false}
                  animate={{ width: `calc(${progressPercent}% * (100% - 72px) / 100)` }}
                  style={{ width: `calc(${progressPercent / 100} * (100% - 72px))` }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                />

                {STEPS.map((s, idx) => {
                  const isCompleted = idx < step;
                  const isActive = idx === step;
                  const StepIcon = s.icon;

                  return (
                    <div key={s.label} className="relative z-10 flex flex-col items-center gap-2 w-28">
                      {/* Bubble */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          isCompleted
                            ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20"
                            : isActive
                            ? "bg-background border-primary text-primary shadow-md ring-4 ring-primary/10"
                            : "bg-background border-border/60 text-muted-foreground/50"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <StepIcon className="w-4 h-4" />
                        )}
                      </div>

                      {/* Labels */}
                      <div className="flex flex-col items-center text-center">
                        <span
                          className={`text-[11px] font-bold tracking-wide transition-colors duration-200 ${
                            isActive || isCompleted ? "text-foreground" : "text-muted-foreground/50"
                          }`}
                        >
                          {s.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50 font-medium hidden sm:block mt-0.5">
                          {s.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Step Content ── */}
            <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0 custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="w-full"
                >
                  {step === 0 && <StaffBasicInformation control={control} disabled={isLoading} />}
                  {step === 1 && <StaffEmployment control={control} disabled={isLoading} />}
                  {step === 2 && <StaffSchedule control={control} watch={watch} setValue={setValue} disabled={isLoading} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Footer ── */}
            <DialogFooter className="m-0 px-6 py-4 border-t bg-muted/10 shrink-0 gap-3 sm:gap-3 flex-row justify-between items-center">
              {/* Step counter */}
              <span className="text-xs text-muted-foreground font-medium select-none">
                Step {step + 1} of {totalSteps}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={back}
                  disabled={isLoading}
                  className="rounded-full px-5 h-9 text-sm font-medium"
                >
                  {step === 0 ? (
                    "Cancel"
                  ) : (
                    <>
                      <ArrowLeft className="mr-1.5 h-4 w-4" />
                      Back
                    </>
                  )}
                </Button>

                {step < STEPS.length - 1 ? (
                  <Button
                    type="button"
                    onClick={next}
                    disabled={isLoading}
                    className="rounded-full px-5 h-9 text-sm font-medium shadow-sm"
                  >
                    Next
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => onSubmit()}
                    disabled={isLoading}
                    className="rounded-full px-6 h-9 text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {mode === "create"
                      ? isLoading ? "Creating..." : "Create Staff"
                      : isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
