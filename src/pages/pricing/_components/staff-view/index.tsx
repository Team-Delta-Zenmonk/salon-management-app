import { useState, useMemo, useEffect } from "react";
import { useAppSelector } from "../../../../store/hooks";
import type { RootState } from "../../../../store/store";
import StaffSidebar from "../staff-sidebar";
import StaffServicesPanel from "../staff-services-panel";
import { isStaffInactive } from "@/utils/staff-status";

export default function StaffView() {
  const staffState = useAppSelector((state: RootState) => state.staff);
  const activeStaffs = useMemo(
    () => (staffState?.data ?? []).filter((s) => !isStaffInactive(s)),
    [staffState?.data]
  );
  const [selectedStaffUuid, setSelectedStaffUuid] = useState<string | null>(() => {
    return activeStaffs.length > 0 ? activeStaffs[0].uuid : null;
  });

  useEffect(() => {
    if (activeStaffs.length > 0) {
      if (!selectedStaffUuid || !activeStaffs.some((s) => s.uuid === selectedStaffUuid)) {
        setSelectedStaffUuid(activeStaffs[0].uuid);
      }
    } else {
      setSelectedStaffUuid(null);
    }
  }, [activeStaffs, selectedStaffUuid]);

  return (
    <div
      style={{
        minHeight: "var(--pricing-container-min-height)",
      }}
      className="flex flex-1 min-h-0 gap-4 sm:gap-6 w-full flex-col lg:flex-row items-stretch lg:h-[var(--pricing-container-height)] lg:max-h-[var(--pricing-container-max-height)]"
    >
      <div
        style={{
          minHeight: "var(--pricing-container-min-height)",
        }}
        className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl w-full h-[var(--pricing-mobile-card-height)] lg:h-full lg:w-[var(--pricing-sidebar-width)] lg:max-h-[var(--pricing-container-max-height)] flex flex-col min-h-0 shadow-sm overflow-hidden shrink-0"
      >
        <StaffSidebar selectedStaffUuid={selectedStaffUuid} onSelectStaff={setSelectedStaffUuid} />
      </div>

      <div
        style={{
          minHeight: "var(--pricing-container-min-height)",
        }}
        className="flex-1 min-w-0 w-full flex flex-col min-h-[400px] lg:h-full lg:min-h-0 lg:max-h-[var(--pricing-container-max-height)] bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl shadow-sm overflow-hidden"
      >
        <div id="staff-services-panel-scroll" className="flex-1 h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <StaffServicesPanel selectedStaffUuid={selectedStaffUuid} />
        </div>
      </div>
    </div>
  );
}

