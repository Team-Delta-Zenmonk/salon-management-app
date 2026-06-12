import { Button, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useState } from "react";
import BookingDialog from "../booking-dialog";

export default function CreateBooking() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        <Typography>Create</Typography>
      </Button>
      <BookingDialog open={open} onClose={() => setOpen(false)} mode="create" />
    </>
  );
}
