import { Button, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useState } from "react";
import ServiceDialog from "../service-dailog";


export default function CreateService() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="contained" startIcon={<AddOutlinedIcon className="text-white!" />} onClick={() => setOpen(true)}>
        <Typography fontWeight="medium">Add</Typography>
      </Button>

      <ServiceDialog open={open} onClose={() => setOpen(false)} mode="create" />
    </>
  );
}
