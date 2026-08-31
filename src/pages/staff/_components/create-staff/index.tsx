import { useState } from "react";
import StaffDialog from "../staff-dialog";
import { Button } from "../../../../components/ui/button";
import { Plus } from "lucide-react";

export default function CreateStaff() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="font-medium gap-2 rounded-full px-5 shadow-md hover:shadow-lg transition-all duration-300"
      >
        <Plus className="w-4 h-4" />
        Add Staff
      </Button>

      <StaffDialog open={open} onClose={() => setOpen(false)} mode="create" />
    </>
  );
}
