import { Button, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useState } from "react";
import ServiceDialog from "../service-dailog";

interface CreateServiceProps {
  onCreatedOrUpdated?: (cb?: () => void) => Promise<void>;
}

export default function CreateService({ onCreatedOrUpdated }: Readonly<CreateServiceProps>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)} >
        <Typography  >Add</Typography>
      </Button>

      <ServiceDialog open={open} onClose={() => setOpen(false)} mode="create" onCreated={onCreatedOrUpdated} />
    </>
  );
}
