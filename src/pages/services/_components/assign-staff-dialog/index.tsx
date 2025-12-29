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
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import type { RootState } from "../../../../store/store";
import { callSnack } from "../../../../components/snackbar";
import styles from "./list-staff.module.scss";
import CheckboxGroup from "../../../../components/form/checkbox";
import { resetStaff, type Staff } from "../../../../features/staff/staff.slice";
import { listStaffAction } from "../../../../features/staff/list-staff/list-staff.action";
import { assignStaffToService } from "../../../../features/staff-service/staff-service.service";
import { listServiceStaff } from "../../../../features/service/list-staff/list-staff.service";
import { unassignStaffFromService } from "../../../../features/staff-service/unassign-staff-service.service";

interface ListStaffDialogProps {
  open: boolean;
  onClose: () => void;
  serviceUuid: string;
  service: any;
  onStaffAssigned?: (cb?: () => void) => Promise<void>;
}

interface StaffAssignmentForm {
  staff: string[];
}

export default function AssignStaffDialog({
  open,
  onClose,
  serviceUuid,
  onStaffAssigned,
  service,
}: ListStaffDialogProps) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAssignedStaff, setIsFetchingAssignedStaff] = useState(false);
  const [initialAssignedStaff, setInitialAssignedStaff] = useState<string[]>([]);

  const staffState = useAppSelector((state: RootState) => state.staff);
  const staffs = staffState?.data ?? [];

  const methods = useForm<StaffAssignmentForm>({
    defaultValues: { staff: [] },
  });
  const { handleSubmit, control, reset } = methods;

  const staffOptions = staffs.map((staff: Staff) => ({
    label: `${staff.first_name} ${staff.last_name || ""}`,
    value: staff.uuid,
  }));

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);

      const selectedStaffUuids = data.staff;

      const staffToAssign = selectedStaffUuids.filter((uuid) => !initialAssignedStaff.includes(uuid));

      const staffToUnassign = initialAssignedStaff.filter((uuid) => !selectedStaffUuids.includes(uuid));

      if (staffToUnassign.length > 0) {
        await Promise.all(staffToUnassign.map((staffUuid) => unassignStaffFromService(staffUuid, service.uuid)));
      }

      if (staffToAssign.length > 0) {
        const payload = {
          staff_services: staffToAssign.map((staffUuid) => ({
            service_uuid: service.uuid,
            staff_uuid: staffUuid,
            price_type: service.price_type,
            price: service.price,
            duration: service.duration ?? 45,
          })),
        };

        await assignStaffToService(payload);
      }

      if (staffToAssign.length > 0 && staffToUnassign.length > 0) {
        callSnack("Staff assignment updated successfully", "success");
      } else if (staffToAssign.length > 0) {
        callSnack("Staff assigned successfully", "success");
      } else if (staffToUnassign.length > 0) {
        callSnack("Staff unassigned successfully", "success");
      } else {
        callSnack("No changes made", "info");
      }

      await onStaffAssigned?.();
      onClose();
    } catch (err: any) {
      callSnack(err?.response?.data?.message || "Staff assignment update failed", "error");
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    if (open) {
      dispatch(resetStaff());
      dispatch(listStaffAction({ page: 1, limit: 100 }));
    }
  }, [open, dispatch]);

  useEffect(() => {
    const fetchAndPopulateAssignedStaff = async () => {
      if (!open || !serviceUuid || staffs.length === 0) return;

      try {
        setIsFetchingAssignedStaff(true);

        const assignedStaffData = await listServiceStaff(serviceUuid);
        const assignedStaffIds = assignedStaffData.map((item: any) => item.staff_id);

        const assignedStaffUuids = staffs
          .filter((staff: Staff) => assignedStaffIds.includes(staff.id))
          .map((staff: Staff) => staff.uuid);

        setInitialAssignedStaff(assignedStaffUuids);
        reset({ staff: assignedStaffUuids });
      } catch (err: any) {
        callSnack("Failed to load assigned staff", "error");
        setInitialAssignedStaff([]);
        reset({ staff: [] });
      } finally {
        setIsFetchingAssignedStaff(false);
      }
    };

    fetchAndPopulateAssignedStaff();
  }, [open, serviceUuid, staffs.length, reset]);

  useEffect(() => {
    if (!open) {
      reset({ staff: [] });
      setInitialAssignedStaff([]);
    }
  }, [open, reset]);

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (isLoading && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
        onClose();
      }}
      className={styles.dialogContainer}
      classes={{ paper: styles.dialog }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle className={clsx(styles.dialogTitle)} fontWeight="fontWeightMedium" variant="h5">
        Assign Staff to "{service?.name}"
      </DialogTitle>

      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <DialogContent className={clsx("flex flex-col py-1 px-3", styles.dialogContent)}>
            {isFetchingAssignedStaff || staffs.length === 0 ? (
              <Box className="flex flex-col items-center justify-center py-12">
                <CircularProgress size={24} className="mb-2" />
                <Typography className="text-gray-500">
                  {isFetchingAssignedStaff ? "Loading assigned staff..." : "Loading staff..."}
                </Typography>
              </Box>
            ) : (
              <Box className="flex flex-col gap-4 max-h-[400px] overflow-y-auto">
                <Typography fontWeight="bold">Select Staff ({staffs.length} available)</Typography>
                <CheckboxGroup name="staff" control={control} identifier="staff-assignment" options={staffOptions} />
              </Box>
            )}
          </DialogContent>

          <DialogActions className={clsx(styles.dialogActions, "px-2 py-1 pb-2")}>
            <Button onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || staffs.length === 0 || isFetchingAssignedStaff}
              loading={isLoading}
            >
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
}
