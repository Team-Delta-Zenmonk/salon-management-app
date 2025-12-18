import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import clsx from "clsx";
import { FormProvider, useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import type { RootState } from "../../../../store/store";
import { callSnack } from "../../../../components/snackbar";
import CheckboxGroup from "../../../../components/form/checkbox";
import styles from "./assign-services.module.scss";
import { listServicesAction } from "../../../../features/service/list-services/list-service.action";
import { assignStaffToService } from "../../../../features/staff-service/staff-service.service";
import { listStaffServices } from "../../../../features/staff/list-services/list-services.service";

interface AssignServicesDialogProps {
  open: boolean;
  onClose: () => void;
  staff: { uuid: string; id: number };
  onAssigned?: () => Promise<void> | void;
}

interface FormType {
  services: string[];
}

export default function AssignServicesDialog({ open, onClose, staff, onAssigned }: AssignServicesDialogProps) {
  const dispatch = useAppDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const services = useAppSelector((state: RootState) => state.service.services) ?? [];

  const methods = useForm<FormType>({
    defaultValues: { services: [] },
  });

  const { control, handleSubmit, reset } = methods;

  const serviceOptions = useMemo(() => services.map((s: any) => ({ label: s.name, value: s.uuid })), [services]);

  useEffect(() => {
    if (!open) return;
    dispatch(listServicesAction(undefined));
  }, [open, dispatch]);

  useEffect(() => {
    const fetchAssigned = async () => {
      if (!open || !staff?.uuid) return;

      try {
        setIsFetching(true);

        const assigned = await listStaffServices(staff.uuid);
        const assignedServiceIds = assigned.map((x: any) => x.service_id);

        const assignedServiceUuids =
          services.filter((s: any) => assignedServiceIds.includes(s.id)).map((s: any) => s.uuid) ?? [];

        reset({ services: assignedServiceUuids });
      } catch (e: any) {
        callSnack("Failed to load assigned services", "error");
        reset({ services: [] });
      } finally {
        setIsFetching(false);
      }
    };
    fetchAssigned();
  }, [open, staff?.uuid, services, reset]);

  useEffect(() => {
    if (!open) reset({ services: [] });
  }, [open, reset]);

  const onSubmit = handleSubmit(async (data) => {
    if (!data.services?.length) {
      callSnack("Please select at least one service", "error");
      return;
    }

    try {
      setIsSaving(true);

      const selectedServices = services.filter((s: any) => data.services.includes(s.uuid));

      const payload = {
        staff_services: selectedServices.map((s: any) => ({
          service_uuid: s.uuid,
          staff_uuid: staff.uuid,
          price_type: s.price_type,
          price: s.price,
          duration: s.duration ?? 45,
        })),
      };

      await assignStaffToService(payload);

      callSnack("Services assigned successfully", "success");
      await onAssigned?.();
      onClose();
    } catch (err: any) {
      callSnack(err?.response?.data?.message || "Service Assignment Failed", "error");
    } finally {
      setIsSaving(false);
    }
  });

  const showLoader = isFetching || !serviceOptions.length;

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (isSaving && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
        onClose();
      }}
      className={styles.dialogContainer}
      classes={{ paper: styles.dialog }}
    >
      <DialogTitle className={clsx(styles.dialogTitle)} fontWeight="fontWeightMedium" variant="h5">
        Assign Services to Staff
      </DialogTitle>

      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <DialogContent className={clsx("flex flex-col py-1 px-3", styles.dialogContent)}>
            {showLoader ? (
              <Box className="flex flex-col items-center justify-center py-12">
                <CircularProgress size={24} className="mb-2" />
                <Typography className="text-gray-500">
                  {isFetching ? "Loading assigned services..." : "Loading services..."}
                </Typography>
              </Box>
            ) : (
              <Box className="flex flex-col gap-4">
                <Typography fontWeight="bold">Select Services ({serviceOptions.length} available)</Typography>
                <CheckboxGroup
                  name="services"
                  control={control}
                  identifier="staff-services-assignment"
                  options={serviceOptions}
                />
              </Box>
            )}
          </DialogContent>

          <DialogActions className={clsx(styles.dialogActions, "px-2 py-1 pb-2")}>
            <Button onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || showLoader}>
              {isSaving ? (
                <>
                  <CircularProgress size={20} className="mr-2" />
                  Saving...
                </>
              ) : (
                "Assign"
              )}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
}
