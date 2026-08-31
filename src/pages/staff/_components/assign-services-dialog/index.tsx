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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Loader2 } from "lucide-react";
import type { Service } from "../../../../features/service/service.slice";

interface AssignedStaffService {
  uuid: string;
  service_id: number;
}

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

  const [assignedStaffServices, setAssignedStaffServices] = useState<AssignedStaffService[]>([]);
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
        .filter(Boolean) as [string, AssignedStaffService][],
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

    const subServicesMap = services.reduce<Record<string, Service[]>>((acc, s) => {
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
    } catch (err: unknown) {
      const error = err as { message?: string };
      callSnack(error?.message || "Failed to update services", "error");
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
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="px-6 py-5 border-b bg-muted/20">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Assign Services
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <div className="flex flex-col py-5 px-6 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar min-h-[220px]">
            {loading ? (
              <div className="flex justify-center items-center py-12 flex-1">
                <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
              </div>
            ) : (
              <form id="assign-services-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Select sub-services to assign to this staff member:
                </p>

                <div className="mt-2 border border-border/40 rounded-2xl p-4 bg-muted/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                  <CheckboxTree
                    name="service_uuids"
                    control={methods.control}
                    identifier="assign-services"
                    options={serviceOptions}
                  />
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
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
              form="assign-services-form"
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
