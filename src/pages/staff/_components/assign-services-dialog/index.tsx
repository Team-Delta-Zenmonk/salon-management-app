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
import { FormProvider, useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import type { RootState } from "../../../../store/store";
import { callSnack } from "../../../../components/snackbar";
import CheckboxTree from "../../../../components/form/checkbox-tree";
import { listServicesAction } from "../../../../features/service/list-services/list-service.action";
import { listStaffServices } from "../../../../features/staff/list-services/list-services.service";
import { assignStaffToService } from "../../../../features/staff-service/staff-service.service";
import { unassignStaffFromService } from "../../../../features/staff-service/unassign-staff-service.service";
import styles from "./assign-services.module.scss";
import clsx from "clsx";

interface AssignServicesDialogProps {
  open: boolean;
  onClose: () => void;
  staff: { uuid: string };
  onAssigned?: () => void;
}
interface FormValues {
  service_uuids: string[];
}

export default function AssignServicesDialog({
  open,
  onClose,
  staff,
  onAssigned,
}: Readonly<AssignServicesDialogProps>) {
  const dispatch = useAppDispatch();

  const methods = useForm<FormValues>({
    defaultValues: { service_uuids: [] },
  });

  const { handleSubmit, reset } = methods;

  const { data: services } = useAppSelector((state: RootState) => state.service);

  const [assignedStaffServices, setAssignedStaffServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setLoading(true);

    dispatch(listServicesAction({ page: 1, limit: 1000 }));

    listStaffServices(staff.uuid)
      .then((res) => {
        setAssignedStaffServices(res || []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, staff.uuid, dispatch]);

  const serviceIdToUuidMap = useMemo(() => {
    return new Map(services.map((s) => [s.id, s.uuid]));
  }, [services]);

  const assignedServiceMap = useMemo(() => {
    return new Map(
      assignedStaffServices
        .map((ss) => {
          const serviceUuid = serviceIdToUuidMap.get(ss.service_id);
          return serviceUuid ? [serviceUuid, ss] : null;
        })
        .filter(Boolean) as [string, any][],
    );
  }, [assignedStaffServices, serviceIdToUuidMap]);

  useEffect(() => {
    if (!services.length) return;

    reset({
      service_uuids: Array.from(assignedServiceMap.keys()),
    });
  }, [assignedServiceMap, services, reset]);

  const serviceOptions = useMemo(() => {
    const rootServices = services.filter((s) => s.parent_id === null);

    const subServicesMap = services.reduce<Record<string, any[]>>((acc, s) => {
      if (s.parent_id) {
        const pId = String(s.parent_id);
        acc[pId] = acc[pId] || [];
        acc[pId].push(s);
      }
      return acc;
    }, {});

    return rootServices.map((service) => ({
      label: service.name,
      value: service.uuid,
      children: (subServicesMap[String(service.id)] || []).map((sub) => ({
        label: sub.name,
        value: sub.uuid,
      })),
    }));
  }, [services]);

  const onSubmit = async (values: FormValues) => {
    setSaving(true);

    try {
      const selectedServiceUuids = values.service_uuids.filter((uuid) => {
        const service = services.find((s) => s.uuid === uuid);
        if (!service) return false;
        const hasChildren = services.some((s) => s.parent_id && String(s.parent_id) === String(service.id));
        return !hasChildren;
      });

      const toAssign = selectedServiceUuids
        .filter((serviceUuid) => !assignedServiceMap.has(serviceUuid))
        .map((serviceUuid) => {
          const service = services.find((s) => s.uuid === serviceUuid);

          return {
            staff_uuid: staff.uuid,
            service_uuid: serviceUuid,
            price_type: service?.price_type,
            price: service?.price ? Number(service.price) : undefined,
            duration: service?.duration ? Number(service.duration) : undefined,
          };
        });

      const toUnassign = Array.from(assignedServiceMap.entries())
        .filter(([serviceUuid]) => !selectedServiceUuids.includes(serviceUuid))
        .map(([, staffService]) => staffService.uuid);

      if (toAssign.length > 0) {
        await assignStaffToService({ staff_services: toAssign });
      }

      if (toUnassign.length > 0) {
        await unassignStaffFromService({ staff_services: toUnassign });
      }

      callSnack("Services updated successfully", "success");
      onAssigned?.();
      onClose();
    } catch (err: any) {
      callSnack(err?.message || "Failed to update services", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (saving && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
        onClose();
      }}
      fullWidth
      maxWidth="sm"
      classes={{ paper: styles.dialog }}
    >
      <DialogTitle sx={{ pb: 0 }} className={styles.dialogTitle}>
        Assign Services
      </DialogTitle>

      <FormProvider {...methods}>
        <DialogContent dividers className={clsx(styles.dialogContent)} sx={{ maxHeight: 400, overflowY: "auto" }}>
          {loading ? (
            <Box className="flex justify-center py-6">
              <CircularProgress />
            </Box>
          ) : (
            <form id="assign-services-form" onSubmit={handleSubmit(onSubmit)}>
              <Typography variant="body2" className="text-(--app-muted) mb-4">
                Select services to assign to this staff member
              </Typography>

              <CheckboxTree
                name="service_uuids"
                control={methods.control}
                identifier="assign-services"
                options={serviceOptions}
              />
            </form>
          )}
        </DialogContent>

        <DialogActions className={styles.dialogActions}>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="assign-services-form"
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} /> : null}
          >
            Save
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
