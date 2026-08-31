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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Loader2 } from "lucide-react";
import type { Staff } from "../../../../features/staff/staff.slice";

interface AssignStaffDialogProps {
  open: boolean;
  onClose: () => void;
  serviceUuid: string;
  service: {
    price_type: string;
    price: number;
    duration: number | string;
  };
  onStaffAssigned?: () => void;
}
interface FormValues {
  staff_ids: string[];
}

interface AssignedStaffService {
  uuid?: string;
  service_uuid?: string;
  staff_uuid?: string;
  price_type?: string;
  price?: number;
  duration?: number;
  staff_id?: number;
  service_id?: number;
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
  const [assignedStaffServices, setAssignedStaffServices] = useState<AssignedStaffService[]>([]);
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
        const allRows: AssignedStaffService[] = [];
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
    const map = new Map<string, AssignedStaffService[]>();
    assignedStaffServices.forEach((ss) => {
      const staffUuid = ss.staff_uuid || (ss.staff_id ? staffIdToUuidMap.get(ss.staff_id) : undefined);
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
    return allStaff.map((staff: Staff) => ({
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
        { uuid: serviceUuid, price_type: service.price_type, price: service.price, duration: Number(service.duration) },
        ...childrenServices.map((s) => ({
          uuid: s.uuid,
          price_type: s.price_type,
          price: s.price ? Number(s.price) : undefined,
          duration: s.duration ? Number(s.duration) : undefined,
        })),
      ];

      const toAssign: {
        service_uuid: string;
        staff_uuid: string;
        price_type: string;
        price?: number;
        duration?: number;
      }[] = [];
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
          records.forEach((record) => {
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
    } catch (err: unknown) {
      const error = err as { message?: string };
      callSnack(error?.message || "Failed to update staff assignment", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          if (saving) return;
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[450px] p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="px-6 py-5 border-b bg-muted/20">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Assign Staff
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <div className="flex flex-col py-5 px-6 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar min-h-[200px]">
            {loading ? (
              <div className="flex justify-center items-center py-12 flex-1">
                <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
              </div>
            ) : (
              <form id="assign-staff-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Select staff members to assign to this service:
                </p>

                <div className="mt-2 border border-border/40 rounded-2xl p-4 bg-muted/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                  <CheckboxGroup
                    name="staff_ids"
                    control={methods.control}
                    identifier="assign-staff"
                    options={staffOptions}
                    optionGap={2}
                  />
                </div>
              </form>
            )}
          </div>

          <DialogFooter className="m-0 px-6 py-4 border-t bg-muted/10 gap-3 sm:gap-3 flex-row justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="rounded-full px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="assign-staff-form"
              disabled={saving || loading}
              className="rounded-full px-6 shadow-md hover:shadow-lg transition-shadow"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
