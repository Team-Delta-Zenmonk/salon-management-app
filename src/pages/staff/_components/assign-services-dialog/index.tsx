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
import { resetServices } from "../../../../features/service/service.slice";
import { unassignStaffFromService } from "../../../../features/staff-service/unassign-staff-service.service";
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
  const [initialAssignedServices, setInitialAssignedServices] = useState<string[]>([]);
  const serviceState = useAppSelector((state: RootState) => state.service);
  const services = serviceState?.data ?? [];

  const methods = useForm<FormType>({
    defaultValues: { services: [] },
  });
  const { control, handleSubmit, reset, watch } = methods;
  const currentServiceSelection = watch("services");

  const serviceOptions = useMemo(
    () => services.map((s: any) => ({ label: s.name, value: s.uuid })),
    [services]
  );

  const onSubmit = handleSubmit(async (data) => {
    if (!data.services?.length) {
      callSnack("Please select at least one service", "error");
      return;
    }

    try {
      setIsSaving(true);
      const servicesToAssign = data.services.filter((uuid) => !initialAssignedServices.includes(uuid));
      const servicesToUnassign = initialAssignedServices.filter((uuid) => !data.services.includes(uuid));

      if (servicesToUnassign.length > 0) {
        await Promise.all(
          servicesToUnassign.map((serviceUuid) =>
            unassignStaffFromService(staff.uuid, serviceUuid).catch((err) => {
              console.error(`Failed to unassign service ${serviceUuid}:`, err);
              return null;
            })
          )
        );
      }

      if (servicesToAssign.length > 0) {
        const selectedServices = services.filter((s: any) => servicesToAssign.includes(s.uuid));
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
      }
      const message = `Services updated successfully: ${servicesToAssign.length} assigned, ${servicesToUnassign.length} removed`;
      callSnack(message, "success");
      
      await onAssigned?.();
      onClose();
    } catch (err: any) {
      callSnack(err?.response?.data?.message || "Service Assignment Failed", "error");
    } finally {
      setIsSaving(false);
    }
  });

  useEffect(() => {
    if (open) {
      dispatch(resetServices());
      dispatch(listServicesAction({ page: 1, limit: 100 }));
    }
  }, [open, dispatch]);

  useEffect(() => {
    const fetchAssigned = async () => {
      if (!open || !staff?.uuid || services.length === 0) return;

      try {
        setIsFetching(true);
        const assigned = await listStaffServices(staff.uuid);
        let assignedServiceUuids: string[] = [];
        if (assigned.some((item: any) => item.service_uuid)) {
          assignedServiceUuids = assigned.map((x: any) => x.service_uuid);
        } else {
          const assignedServiceIds = assigned.map((x: any) => x.service_id);
          assignedServiceUuids = services
            .filter((s: any) => assignedServiceIds.includes(s.id))
            .map((s: any) => s.uuid);
        }
        setInitialAssignedServices(assignedServiceUuids);
        reset({ services: assignedServiceUuids });
      } catch (e: any) {
        callSnack("Failed to load assigned services", "error");
        setInitialAssignedServices([]);
        reset({ services: [] });
      } finally {
        setIsFetching(false);
      }
    };
    fetchAssigned();
  }, [open, staff?.uuid, services.length, reset, services]);

  useEffect(() => {
    if (!open) {
      setInitialAssignedServices([]);
      reset({ services: [] });
    }
  }, [open, reset]);

  const showLoader = isFetching || services.length === 0;

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (isSaving && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
        onClose();
      }}
      className={styles.dialogContainer}
      classes={{ paper: styles.dialog }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle className={clsx(styles.dialogTitle)} fontWeight="fontWeightMedium" variant="h5">
        Assign Services
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
              <Box className="flex flex-col gap-4 max-h-[500px] overflow-y-auto">
                <Typography fontWeight="bold">
                  Select Services ({services.length} available)
                  {initialAssignedServices.length > 0 && (
                    <Typography component="span" className="text-sm text-blue-600 ml-2">
                      ({initialAssignedServices.length} already assigned)
                    </Typography>
                  )}
                </Typography>
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
            <Button 
              type="submit" 
              disabled={isSaving || showLoader || serviceOptions.length === 0}
              variant="contained"
              loading={isSaving}
            >
              {isSaving ? "Updating..." : "Update Assignments"}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
}
