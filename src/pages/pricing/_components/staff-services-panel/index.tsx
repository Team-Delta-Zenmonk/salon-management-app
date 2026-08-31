import { useEffect, useState, useMemo, useCallback } from "react";
import { useAppSelector } from "../../../../store/hooks";
import type { RootState } from "../../../../store/store";
import { listStaffServices } from "../../../../features/staff/list-services/list-services.service";
import { unassignStaffFromService } from "../../../../features/staff-service/unassign-staff-service.service";
import { assignStaffToService } from "../../../../features/staff-service/staff-service.service";
import { callSnack } from "../../../../components/snackbar";
import AssignServicesDialog from "../../../staff/_components/assign-services-dialog";
import StaffServicePricingDialog from "../staff-service-pricing-dialog";
import type { StaffPricingType } from "../../types/staff-service.types";
import clsx from "clsx";
import { Plus, Edit2, Trash2, Scissors, User, Loader2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import type { Staff } from "../../../../features/staff/staff.slice";
import type { Service } from "../../../../features/service/service.slice";

interface StaffServicesPanelProps {
  selectedStaffUuid: string | null;
}

interface DialogContext {
  staff_uuid: string;
  staff_name: string;
  service_uuid: string;
  service_name: string;
  current?: StaffPricingType;
}

export default function StaffServicesPanel({ selectedStaffUuid }: Readonly<StaffServicesPanelProps>) {
  const staffState = useAppSelector((state: RootState) => state.staff);
  const staffs = staffState?.data ?? [];
  const selectedStaff = staffs.find((s: Staff) => s.uuid === selectedStaffUuid);

  const { data: allServices } = useAppSelector((state: RootState) => state.service);

  const [assignedServices, setAssignedServices] = useState<StaffPricingType[]>([]);
  const [loading, setLoading] = useState(false);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [dialogContext, setDialogContext] = useState<DialogContext | null>(null);

  const loadAssignedServices = useCallback(async () => {
    if (!selectedStaffUuid) return;
    try {
      setLoading(true);
      const res = await listStaffServices(selectedStaffUuid);
      const rows = Array.isArray(res) ? res : (res?.rows ?? res?.data ?? []);
      setAssignedServices(rows);
    } catch {
      callSnack("Failed to load staff services", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedStaffUuid]);

  useEffect(() => {
    loadAssignedServices();
  }, [loadAssignedServices]);

  const groupedServices = useMemo(() => {
    if (!allServices.length || !assignedServices.length) return [];

    const serviceIdMap = new Map<number, Service>(allServices.map((s: Service) => [s.id, s]));

    const groups = new Map<number, { parent: Service; services: (Service & { pricing: StaffPricingType })[] }>();

    assignedServices.forEach((pricingRow) => {
      const service = serviceIdMap.get(pricingRow.service_id);
      if (!service) return;

      const hasChildren = allServices.some((s: Service) => s.parent_id && String(s.parent_id) === String(service.id));
      if (hasChildren && !service.parent_id) {
        return;
      }

      const parentId = service.parent_id ? Number(service.parent_id) : service.id;
      const parentService = serviceIdMap.get(parentId);

      if (!parentService) return;

      if (!groups.has(parentId)) {
        groups.set(parentId, { parent: parentService, services: [] });
      }

      groups.get(parentId)!.services.push({ ...service, pricing: pricingRow });
    });

    return Array.from(groups.values()).sort((a, b) => a.parent.name.localeCompare(b.parent.name));
  }, [allServices, assignedServices]);

  const handleOpenEdit = (serviceRow: Service & { pricing: StaffPricingType }) => {
    if (!selectedStaffUuid || !selectedStaff) return;

    setDialogContext({
      staff_uuid: selectedStaffUuid,
      staff_name: `${selectedStaff.first_name} ${selectedStaff.last_name || ""}`.trim(),
      service_uuid: serviceRow.uuid,
      service_name: serviceRow.name,
      current: serviceRow.pricing,
    });
    setPricingDialogOpen(true);
  };

  const handleSavePricing = async (payload: { price_type: string; price: number; duration: number }) => {
    if (!dialogContext) return;

    try {
      await assignStaffToService({
        staff_services: [
          {
            staff_uuid: dialogContext.staff_uuid,
            service_uuid: dialogContext.service_uuid,
            price_type: payload.price_type,
            price: payload.price,
            duration: payload.duration,
          },
        ],
      });
      await loadAssignedServices();
      callSnack("Pricing updated successfully", "success");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      callSnack(err?.response?.data?.message || "Failed to update pricing", "error");
    } finally {
      setPricingDialogOpen(false);
      setDialogContext(null);
    }
  };

  const handleRemove = async (staffServiceUuid: string) => {
    try {
      await unassignStaffFromService({ staff_services: [staffServiceUuid], cascade: false });
      await loadAssignedServices();
      callSnack("Service unassigned successfully", "success");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      callSnack(err?.response?.data?.message || "Failed to unassign service", "error");
    }
  };

  if (!selectedStaffUuid || !selectedStaff) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center bg-card">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 border border-border/40">
          <User className="text-muted-foreground w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-foreground">
          No Staff Selected
        </h3>
        <p className="text-muted-foreground/80 text-sm mt-1 max-w-sm">
          Select a staff member from the sidebar to manage their services.
        </p>
      </div>
    );
  }

  const staffDisplayName = `${selectedStaff.first_name} ${selectedStaff.last_name || ""}`.trim();

  return (
    <div className="p-6 md:p-8 flex flex-col min-h-full bg-transparent">
      {/* Panel Header */}
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/60 mb-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="w-1.5 h-6 rounded bg-primary shrink-0" />
            {staffDisplayName}'s Services
          </h2>
          <p className="text-muted-foreground/80 text-xs sm:text-sm">
            Manage the services provided by this staff member and their custom pricing.
          </p>
        </div>
        <Button
          onClick={() => setAssignDialogOpen(true)}
          className="shrink-0 rounded-xl shadow-sm shadow-primary/10"
        >
          <Plus className="mr-2 h-4 w-4" />
          Assign Services
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground font-semibold">Loading services...</span>
        </div>
      ) : assignedServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/80 rounded-2xl bg-muted/10">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4 border border-border/40">
            <Scissors className="text-muted-foreground w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            No Services Assigned
          </h3>
          <p className="text-muted-foreground/80 text-sm mt-1.5 max-w-xs">
            This staff member doesn't provide any services yet.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAssignDialogOpen(true)}
            className="mt-5 rounded-xl"
          >
            Assign Services Now
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groupedServices.map((group) => (
            <div key={group.parent.id} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <h4 className="font-bold text-foreground/80 text-xs uppercase tracking-wider">
                  {group.parent.name}
                </h4>
                <div className="h-px bg-border/55 flex-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.services.map((svc) => (
                  <div
                    key={svc.uuid}
                    className="group relative border border-border/50 rounded-2xl p-4.5 flex items-center justify-between bg-card/60 backdrop-blur-md hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 transition-all duration-300 overflow-hidden"
                  >
                    {/* Hover Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <div className="flex items-center gap-3.5 min-w-0 pr-4 relative z-10">
                      <Avatar className="w-11 h-11 bg-muted border border-border/40 text-muted-foreground transition-transform duration-200 group-hover:scale-105">
                        {svc.logo ? (
                            <AvatarImage src={svc.logo} alt={svc.name} />
                        ) : (
                            <AvatarFallback className="bg-transparent"><Scissors className="h-5 w-5"/></AvatarFallback>
                        )}
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">
                          {svc.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                          <span
                            className={clsx(
                              "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold whitespace-nowrap border",
                              svc.pricing.price_type === "fixed"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10"
                                : svc.pricing.price_type === "from"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10"
                                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/10",
                            )}
                          >
                            {svc.pricing.price_type}
                          </span>
                          <span className="text-xs text-foreground/80 font-bold whitespace-nowrap">
                            ₹{svc.pricing.price ?? "-"}
                          </span>
                          <span className="text-xs text-muted-foreground/50 select-none">•</span>
                          <span className="text-xs text-muted-foreground font-semibold whitespace-nowrap">
                            {svc.pricing.duration ?? "-"} min
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 relative z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(svc)}
                        className="h-8.5 w-8.5 rounded-full hover:bg-purple-500/10 hover:text-purple-600 text-muted-foreground transition-all"
                        title="Edit Custom Pricing"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => svc.pricing.uuid && handleRemove(svc.pricing.uuid)}
                        className="h-8.5 w-8.5 rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
                        title="Unassign Service"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedStaff && assignDialogOpen && (
        <AssignServicesDialog
          open={assignDialogOpen}
          onClose={() => setAssignDialogOpen(false)}
          staff={{ uuid: selectedStaff.uuid }}
          onAssigned={loadAssignedServices}
        />
      )}

      {dialogContext && (
        <StaffServicePricingDialog
          open={pricingDialogOpen}
          onClose={() => {
            setPricingDialogOpen(false);
            setDialogContext(null);
          }}
          context={dialogContext}
          onSave={handleSavePricing}
        />
      )}
    </div>
  );
}
