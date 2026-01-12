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
}: AssignStaffDialogProps) {
  const dispatch = useAppDispatch();

  const methods = useForm<FormValues>({
    defaultValues: { staff_ids: [] },
  });

  const { handleSubmit, reset } = methods;

  const { data: allStaff } = useAppSelector((state: RootState) => state.staff);

  const [assignedStaffServices, setAssignedStaffServices] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    dispatch(listStaffAction({}));
    listServiceStaff(serviceUuid)
      .then((res) => {
        setAssignedStaffServices(res || []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, serviceUuid]);

  const staffIdToUuidMap = useMemo(() => {
    return new Map(allStaff.map((s) => [s.id, s.uuid]));
  }, [allStaff]);

  const assignedStaffMap = useMemo(() => {
    return new Map(
      assignedStaffServices
        .map((ss) => {
          const staffUuid = staffIdToUuidMap.get(ss.staff_id);
          return staffUuid ? [staffUuid, ss] : null;
        })
        .filter(Boolean) as [string, any][]
    );
  }, [assignedStaffServices, staffIdToUuidMap]);

  useEffect(() => {
    if (!assignedStaffServices.length || !allStaff.length) return;

    reset({
      staff_ids: Array.from(assignedStaffMap.keys()),
    });
  }, [assignedStaffMap, allStaff]);

  const staffOptions = useMemo(() => {
    return allStaff.map((staff) => ({
      label: `${staff.first_name} ${staff.last_name ?? ""}`,
      value: staff.uuid,
    }));
  }, [allStaff]);

  const onSubmit = async (values: FormValues) => {
    setSaving(true);

    try {
      const selectedStaffUuids = values.staff_ids;
      const toAssign = selectedStaffUuids
        .filter((staffUuid) => !assignedStaffMap.has(staffUuid))
        .map((staffUuid) => ({
          service_uuid: serviceUuid,
          staff_uuid: staffUuid,
          price_type: service.price_type,
          price: service.price,
          duration: service.duration,
        }));

      const toUnassign = Array.from(assignedStaffMap.entries())
        .filter(([staffUuid]) => !selectedStaffUuids.includes(staffUuid))
        .map(([, staffService]) => staffService.uuid);

      if (toAssign.length > 0) {
        await assignStaffToService({ staff_services: toAssign });
      }

      if (toUnassign.length > 0) {
        await unassignStaffFromService({ staff_services: toUnassign });
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
        close();
      }}
      fullWidth
      maxWidth="sm"
      classes={{ paper: styles.dialog }}
    >
      <DialogTitle>Assign Staff</DialogTitle>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent className={clsx(styles.dialogContent)}>
            {loading ? (
              <Box className="flex justify-center py-6">
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Typography variant="body2">Select staff members to assign to this service</Typography>

                <CheckboxGroup
                  name="staff_ids"
                  control={methods.control}
                  identifier="assign-staff"
                  options={staffOptions}
                  optionGap={2}
                />
              </>
            )}
          </DialogContent>

          <DialogActions className={styles.dialogActions}>
            <Button onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={18} /> : null}
            >
              Save
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
}
