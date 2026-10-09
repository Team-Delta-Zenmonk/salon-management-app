import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import type { RootState } from "../../../../store/store";
import { callSnack } from "../../../../components/snackbar";
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import { Loader2, UserCheck, Users } from "lucide-react";
import type { Staff } from "../../../../features/staff/staff.slice";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { motion, AnimatePresence } from "framer-motion";
import { EllipsisCell } from "@/components/ellipse-cell";

dayjs.extend(customParseFormat);

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

const getFullName = (staff: Staff) =>
  `${staff.first_name} ${staff.last_name || ""}`.trim();

const getInitials = (staff: Staff) =>
  `${staff.first_name?.charAt(0) ?? ""}${staff.last_name?.charAt(0) ?? ""}`.toUpperCase() || "S";

const isStaffActive = (staff: Staff) =>
  !staff.end_date || dayjs(staff.end_date, "DD-MM-YYYY").isAfter(dayjs());

function StaffRow({
  staff,
  selected,
  onToggle,
}: {
  staff: Staff;
  selected: boolean;
  onToggle: () => void;
}) {
  const active = isStaffActive(staff);

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      onClick={onToggle}
      className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer group
        ${selected
          ? "bg-primary/8 border-primary/30 shadow-sm shadow-primary/10"
          : "bg-card/60 border-border/40 hover:border-primary/20 hover:bg-muted/40"
        }`}
    >
      <div className="relative shrink-0">
        <Avatar className={`w-10 h-10 rounded-xl ring-2 transition-all duration-200 ${selected ? "ring-primary/30" : "ring-border/30 group-hover:ring-primary/20"}`}>
          <AvatarImage
            src={staff.photos?.url || undefined}
            alt={getFullName(staff)}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/8 text-primary font-bold text-sm rounded-xl">
            {getInitials(staff)}
          </AvatarFallback>
        </Avatar>
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${active ? "bg-emerald-500" : "bg-destructive/70"}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-tight truncate capitalize transition-colors duration-200 ${selected ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
          <EllipsisCell value={getFullName(staff)} maxLines={1} maxChars={20} />
        </p>
        <p className="text-[11px] text-muted-foreground truncate capitalize mt-0.5">
          <EllipsisCell value={staff.title || "Staff Member"} maxLines={1} maxChars={20} />
        </p>
      </div>
      <div
        className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
          ${selected ? "bg-primary border-primary" : "border-border/60 group-hover:border-primary/40"}`}
      >
        <AnimatePresence>
          {selected && (
            <motion.svg
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              viewBox="0 0 12 9"
              className="w-3 h-3 fill-none stroke-primary-foreground stroke-2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="1 4.5 4.5 8 11 1" />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
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

  const { handleSubmit, reset, setValue, control } = methods;
  const selectedIds = useWatch({ control, name: "staff_ids" }) ?? [];

  const { data: allStaff } = useAppSelector((state: RootState) => state.staff);
  const { data: allServices } = useAppSelector((state: RootState) => state.service);
  const salonUUID = useAppSelector((state: RootState) => state.auth.salon?.uuid ?? "");
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
    reset({ staff_ids: Array.from(assignedStaffMap.keys()) });
  }, [assignedStaffMap, allStaff, reset]);

  const toggleStaff = (uuid: string) => {
    const current = selectedIds;
    if (current.includes(uuid)) {
      setValue("staff_ids", current.filter((id) => id !== uuid), { shouldDirty: true });
    } else {
      setValue("staff_ids", [...current, uuid], { shouldDirty: true });
    }
  };

  const selectedCount = selectedIds.length;

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
        if (!isOpen && !saving) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden border border-border/60 shadow-2xl rounded-2xl">
        <DialogHeader className="px-6 py-5 border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-bold tracking-tight text-foreground flex flex-row gap-2">
                Assign Staff
                {!loading && allStaff.length > 0 && (
                  <div className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors duration-200 ${selectedCount > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {selectedCount} / {allStaff.length}
                  </div>
                )}
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Select who can perform this service
              </p>
            </div>
          </div>
        </DialogHeader>

        <FormProvider {...methods}>
          <div className="flex flex-col min-h-0" style={{ maxHeight: "calc(100vh - 240px)" }}>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-primary/50" />
                <p className="text-sm text-muted-foreground">Loading staff…</p>
              </div>
            ) : allStaff.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center">
                  <Users className="w-6 h-6 text-muted-foreground/40" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">No staff members found</p>
                  <p className="text-xs text-muted-foreground max-w-[260px] leading-relaxed">
                    Add staff members first, then assign them to services.
                  </p>
                </div>
              </div>
            ) : (
              <form
                id="assign-staff-form"
                onSubmit={handleSubmit(onSubmit)}
                className="flex-1 overflow-y-auto"
              >
                <div className="px-4 py-3 space-y-2">
                  {allStaff.map((staff) => (
                    <StaffRow
                      key={staff.uuid}
                      staff={staff}
                      selected={selectedIds.includes(staff.uuid)}
                      onToggle={() => toggleStaff(staff.uuid)}
                    />
                  ))}
                </div>
              </form>
            )}
          </div>

          <DialogFooter className="m-0 px-6 py-4 border-t bg-muted/10 shrink-0 gap-3 sm:gap-3 flex-row justify-between items-center">
            <p className="text-xs text-muted-foreground hidden sm:block">
              {selectedCount === 0
                ? "No staff selected"
                : `${selectedCount} staff member${selectedCount !== 1 ? "s" : ""} selected`}
            </p>

            <div className="flex items-center gap-3 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={saving}
                className="rounded-full px-6"
              >
                Cancel
              </Button>
              {allStaff.length > 0 && (
                <Button
                  type="submit"
                  form="assign-staff-form"
                  disabled={saving || loading}
                  className="rounded-full px-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-1.5 h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
