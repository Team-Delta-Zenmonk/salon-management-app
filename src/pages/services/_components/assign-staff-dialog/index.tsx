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
import CheckboxGroup from "../../../../components/form/checkbox";
import { listStaffAction } from "../../../../features/staff/list-staff/list-staff.action";
import { listServiceStaff } from "../../../../features/service/list-staff/list-staff.service";
import { assignStaffToService } from "../../../../features/staff-service/staff-service.service";
import { unassignStaffFromService } from "../../../../features/staff-service/unassign-staff-service.service";
import styles from "./list-staff.module.scss";
import clsx from "clsx";

interface AssignStaffDialogProps {
  open: boolean;
  onClose: () => void;
  serviceUuid: string;
  service: {
    price_type: string;
    price: number;
    duration: number;
  };
  onStaffAssigned?: () => void;
}
interface FormValues {
  staff_ids: string[];
}

export default function AssignStaffDialog({
  open,
  onClose,
  serviceUuid,
  service,
  onStaffAssigned,
}: Readonly<AssignStaffDialogProps>) {
  const dispatch = useAppDispatch();

  const methods = useForm<FormValues>({
    defaultValues: { staff_ids: [] },
  });

  const { handleSubmit, reset } = methods;

  const { data: allStaff } = useAppSelector((state: RootState) => state.staff);
  const { data: allServices } = useAppSelector((state: RootState) => state.service);
  const salonUUID = useAppSelector((state) => state.auth.salon.uuid);
  const [assignedStaffServices, setAssignedStaffServices] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setAssignedStaffServices([]);
    reset({ staff_ids: [] });
    dispatch(listStaffAction({ page: 1, limit: 1000 }));

    const parentServiceObj = allServices.find((s) => s.uuid === serviceUuid);
    const childrenServices = parentServiceObj
      ? allServices.filter((s) => s.parent_id && String(s.parent_id) === String(parentServiceObj.id))
      : [];
    const serviceUuidsToQuery = [serviceUuid, ...childrenServices.map((s) => s.uuid)];

    Promise.allSettled(serviceUuidsToQuery.map((uuid) => listServiceStaff(uuid, salonUUID)))
      .then((results) => {
        const allRows: any[] = [];
        results.forEach((result) => {
          if (result.status === "fulfilled") {
            const res = result.value;
            const rows = Array.isArray(res) ? res : (res?.data ?? res?.rows ?? []);
            allRows.push(...rows);
          }
        });
        setAssignedStaffServices(allRows);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, serviceUuid, salonUUID, dispatch, reset, allServices]);

  const staffIdToUuidMap = useMemo(() => {
    return new Map(allStaff.map((s) => [s.id, s.uuid]));
  }, [allStaff]);

  const assignedStaffMap = useMemo(() => {
    const map = new Map<string, any[]>();
    assignedStaffServices.forEach((ss) => {
      const staffUuid = ss.staff_uuid || staffIdToUuidMap.get(ss.staff_id);
      if (!staffUuid) return;
      const existing = map.get(staffUuid) || [];
      existing.push(ss);
      map.set(staffUuid, existing);
    });
    return map;
  }, [assignedStaffServices, staffIdToUuidMap]);

  useEffect(() => {
    if (!allStaff.length) return;

    reset({
      staff_ids: Array.from(assignedStaffMap.keys()),
    });
  }, [assignedStaffMap, allStaff, reset]);

  const staffOptions = useMemo(() => {
    return allStaff.map((staff: any) => ({
      label: `${staff.first_name} ${staff.last_name ?? ""}`,
      value: staff.uuid,
    }));
  }, [allStaff]);

  const onSubmit = async (values: FormValues) => {
    setSaving(true);

    try {
      const selectedStaffUuids = values.staff_ids;

      const parentServiceObj = allServices.find((s) => s.uuid === serviceUuid);
      const childrenServices = parentServiceObj
        ? allServices.filter((s) => s.parent_id && String(s.parent_id) === String(parentServiceObj.id))
        : [];
      const allServicesToAssign = [
        { uuid: serviceUuid, price_type: service.price_type, price: service.price, duration: service.duration },
        ...childrenServices.map((s) => ({
          uuid: s.uuid,
          price_type: s.price_type,
          price: s.price ? Number(s.price) : undefined,
          duration: s.duration ? Number(s.duration) : undefined,
        })),
      ];

      const toAssign: any[] = [];
      selectedStaffUuids
        .filter((staffUuid) => !assignedStaffMap.has(staffUuid))
        .forEach((staffUuid) => {
          allServicesToAssign.forEach((srv) => {
            toAssign.push({
              service_uuid: srv.uuid,
              staff_uuid: staffUuid,
              price_type: srv.price_type,
              price: srv.price,
              duration: srv.duration,
            });
          });
        });

      const toUnassign: string[] = [];
      Array.from(assignedStaffMap.entries())
        .filter(([staffUuid]) => !selectedStaffUuids.includes(staffUuid))
        .forEach(([, records]) => {
          records.forEach((record: any) => {
            if (record.uuid) toUnassign.push(record.uuid);
          });
        });

      if (toAssign.length > 0) {
        await assignStaffToService({ staff_services: toAssign });
      }

      if (toUnassign.length > 0) {
        await unassignStaffFromService({ staff_services: toUnassign, cascade: true });
      }

      callSnack("Staff assignment updated successfully", "success");
      onStaffAssigned?.();
      onClose();
    } catch (err: any) {
      callSnack(err?.message || "Failed to update staff assignment", "error");
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
        Assign Staff
      </DialogTitle>

      <FormProvider {...methods}>
        <DialogContent dividers className={clsx(styles.dialogContent)} sx={{ maxHeight: 400, overflowY: "auto" }}>
          {loading ? (
            <Box className="flex justify-center py-6">
              <CircularProgress />
            </Box>
          ) : (
            <form id="assign-staff-form" onSubmit={handleSubmit(onSubmit)}>
              <Typography variant="body2" className="text-(--app-muted) mb-4">
                Select staff members to assign to this service
              </Typography>

              <CheckboxGroup
                name="staff_ids"
                control={methods.control}
                identifier="assign-staff"
                options={staffOptions}
                optionGap={2}
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
            form="assign-staff-form"
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
