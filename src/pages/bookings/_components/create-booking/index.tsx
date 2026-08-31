import { useState } from "react";
import BookingDialog from "../booking-dialog";
import { Button } from "../../../../components/ui/button";
import { Plus } from "lucide-react";

export default function CreateBooking() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        <span className="font-medium">Create Booking</span>
      </Button>
      <BookingDialog open={open} onClose={() => setOpen(false)} mode="create" />
    </>
  );
}
