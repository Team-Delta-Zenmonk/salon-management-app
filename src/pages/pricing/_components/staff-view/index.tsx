import { useState } from "react";
import { useAppSelector } from "../../../../store/hooks";
import type { RootState } from "../../../../store/store";
import StaffSidebar from "../staff-sidebar";
import StaffServicesPanel from "../staff-services-panel";

export default function StaffView() {
  const staffState = useAppSelector((state: RootState) => state.staff);
  const staffs = staffState?.data ?? [];
  const [selectedStaffUuid, setSelectedStaffUuid] = useState<string | null>(() => {
    return staffs.length > 0 ? staffs[0].uuid : null;
  });

  return (
    <div className="flex flex-1 min-h-0 gap-6 w-full flex-col lg:flex-row items-stretch">
      <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl w-full lg:w-[380px] flex flex-col min-h-[500px] lg:min-h-0 shadow-sm overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <StaffSidebar selectedStaffUuid={selectedStaffUuid} onSelectStaff={setSelectedStaffUuid} />
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col min-h-0 bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <StaffServicesPanel selectedStaffUuid={selectedStaffUuid} />
        </div>
      </div>
    </div>
  );
}

