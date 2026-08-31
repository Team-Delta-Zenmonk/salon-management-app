import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import ServiceDialog from "../service-dailog";

interface CreateServiceProps {
  onCreatedOrUpdated?: (cb?: () => void) => Promise<void>;
}

export default function CreateService({ onCreatedOrUpdated }: Readonly<CreateServiceProps>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="font-medium gap-2 rounded-full px-5 shadow-md hover:shadow-lg transition-all duration-300">
        <PlusIcon className="w-4 h-4" />
        Add Service
      </Button>

      <ServiceDialog open={open} onClose={() => setOpen(false)} mode="create" onCreated={onCreatedOrUpdated} />
    </>
  );
}
