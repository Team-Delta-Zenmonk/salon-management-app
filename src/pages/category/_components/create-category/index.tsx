import { Button, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useState } from "react";
import CategoryDialog from "../category-dialog";

export default function CreateCategory() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        <Typography>Create</Typography>
      </Button>

      <CategoryDialog open={open} onClose={() => setOpen(false)} mode="create" />
    </>
  );
}
