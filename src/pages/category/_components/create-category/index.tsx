import { useState } from "react";
import CategoryDialog from "../category-dialog";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateCategory() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="rounded-full px-6">
        <Plus className="mr-2 h-4 w-4" />
        <span className="font-medium">Create Category</span>
      </Button>

      <CategoryDialog open={open} onClose={() => setOpen(false)} mode="create" />
    </>
  );
}
