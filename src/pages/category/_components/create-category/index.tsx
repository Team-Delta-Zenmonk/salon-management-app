import { Button, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useState } from "react";
import CategoryDialog from "../category-dialog";

export default function CreateCategory() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="contained" startIcon={<AddOutlinedIcon className="text-white!" />} onClick={() => setOpen(true)}>
        <Typography fontWeight="medium">Add</Typography>
      </Button>

      <CategoryDialog open={open} onClose={() => setOpen(false)} mode="create" />
    </>
  );
}
