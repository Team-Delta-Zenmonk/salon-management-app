import { Button, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useState } from "react";
import StaffDialog from "../staff-dialog";

export default function CreateStaff() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        <Typography >Add</Typography>
      </Button>

      <StaffDialog open={open} onClose={() => setOpen(false)} mode="create" />
    </>
  );
}
