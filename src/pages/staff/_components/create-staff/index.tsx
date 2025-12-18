import { Button, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useState } from "react";
import StaffDialog from "../staff-dialog";

export default function CreateStaff() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="contained" startIcon={<AddOutlinedIcon className="text-white!" />} onClick={() => setOpen(true)}>
        <Typography fontWeight="medium">Add</Typography>
      </Button>

      <StaffDialog open={open} onClose={() => setOpen(false)} mode="create" />
    </>
  );
}
