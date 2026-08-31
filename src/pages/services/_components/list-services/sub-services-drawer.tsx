import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../../../components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { listSubServicesService } from "../../../../features/service/list-sub-services/list-sub-services.service";
import { callSnack } from "../../../../components/snackbar";
import { Edit2Icon, Trash2Icon, UserPlusIcon, SparklesIcon, PlusIcon, ClockIcon } from "lucide-react";

import type { Service } from "../../../../features/service/service.slice";

interface SubServicesDrawerProps {
  open: boolean;
  onClose: () => void;
  parentService: Service | null;
  onEdit: (service: Service, parentUuid?: string) => void;
  onDelete: (service: Service, parentUuid?: string) => void;
  onAddSubService: (parentService: Service) => void;
  onAssignStaff: (service: Service) => void;
  deleteLoading: boolean;
  refreshTrigger: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 380, damping: 28 },
  },
};

export function SubServicesDrawer({
  open,
  onClose,
  parentService,
  onEdit,
  onDelete,
  onAddSubService,
  onAssignStaff,
  deleteLoading,
  refreshTrigger,
}: Readonly<SubServicesDrawerProps>) {
  const [subServices, setSubServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !parentService) return;
    let isMounted = true;
    const fetchSubServices = async () => {
      try {
        setLoading(true);
        const res = await listSubServicesService(parentService.uuid);
        if (isMounted) {
          setSubServices(res?.rows ?? []);
        }
      } catch {
        if (isMounted) {
          callSnack("Failed to fetch sub-services", "error");
          setSubServices([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchSubServices();
    return () => {
      isMounted = false;
    };
  }, [open, parentService, refreshTrigger]);

  if (!parentService) return null;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-[480px] p-0 flex flex-col h-full bg-background border-l border-border/40 shadow-2xl">
        <SheetHeader className="p-6 pb-4 border-b bg-muted/20">
          <div className="flex gap-4 items-center">
            <Avatar className="w-12 h-12 ring-2 ring-primary/10">
              <AvatarImage src={parentService.logo || undefined} alt={parentService.name} />
              <AvatarFallback className="bg-primary/5 text-primary font-bold text-lg">
                {parentService.name ? parentService.name.charAt(0).toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg font-bold text-foreground truncate leading-tight">
                {parentService.name}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground truncate">
                Manage all sub-services and pricing configurations.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex justify-between items-center px-6 py-4 bg-muted/5 border-b border-border/40 shrink-0">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Sub-services ({subServices.length})
          </span>
          <Button
            size="sm"
            onClick={() => onAddSubService(parentService)}
            className="h-8 rounded-full px-3 text-xs flex items-center gap-1.5 shadow-sm"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Add Sub-service
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border border-border/30 bg-muted/10 rounded-2xl animate-pulse space-y-3">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-xl bg-foreground/10" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-foreground/10 rounded w-2/3" />
                        <div className="h-3 bg-foreground/10 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="h-5 bg-foreground/10 rounded w-24" />
                  </div>
                ))}
              </motion.div>
            ) : subServices.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="flex flex-col items-center justify-center p-8 border border-dashed border-border/60 rounded-3xl bg-muted/5 mt-4 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-3">
                  <SparklesIcon className="w-6 h-6 text-primary/40" />
                </div>
                <h4 className="font-semibold text-foreground text-sm mb-1">No sub-services configured</h4>
                <p className="text-muted-foreground text-xs max-w-[240px]">
                  Create sub-services to offer variations (e.g. Mens Cut, Womens Cut, etc.) for this service.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-4 pb-6"
              >
                {subServices.map((sub) => (
                  <motion.div
                    key={sub.uuid}
                    variants={itemVariants}
                    className="group relative bg-card border border-border/40 hover:border-primary/30 p-4 rounded-2xl flex flex-col gap-3.5 transition-all duration-300 shadow-xs hover:shadow-md"
                  >
                    <div className="flex gap-3 min-w-0">
                      <Avatar className="w-10 h-10 rounded-xl ring-1 ring-border/50 shrink-0 bg-background overflow-hidden">
                        {sub.logo ? (
                          <AvatarImage src={sub.logo} alt={sub.name} className="object-cover" />
                        ) : (
                          <AvatarFallback className="bg-primary/5 text-primary rounded-xl">
                            <SparklesIcon className="w-4 h-4 opacity-60" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-foreground text-[14px] truncate leading-snug">
                          {sub.name}
                        </div>
                        {sub.description && (
                          <p className="text-muted-foreground text-[11px] mt-0.5 line-clamp-1">
                            {sub.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/40 border border-border/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                          {sub.gender}
                        </div>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/5 border border-primary/10 text-[10px] font-medium text-primary uppercase tracking-wide">
                          {sub.price_type !== "fixed" && (
                            <span className="opacity-60 font-normal mr-0.5">{sub.price_type}</span>
                          )}
                          <span className="font-semibold text-[9px]">₹</span>
                          {sub.price}
                        </div>
                        {sub.duration && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/40 border border-border/40 text-[10px] font-medium text-muted-foreground">
                            <ClockIcon className="w-3 h-3 opacity-60" />
                            {sub.duration} min
                          </div>
                        )}
                        {!sub.is_active && (
                          <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-none text-[9px] h-5 px-1.5 py-0">
                            Inactive
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-0.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-green-500/10 hover:text-green-600 text-muted-foreground transition-colors"
                          onClick={() => onAssignStaff(sub)}
                          disabled={deleteLoading}
                          title="Assign Staff"
                        >
                          <UserPlusIcon className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-purple-500/10 hover:text-purple-600 text-muted-foreground transition-colors"
                          onClick={() => onEdit(sub, parentService.uuid)}
                          disabled={deleteLoading}
                          title="Edit Sub-service"
                        >
                          <Edit2Icon className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                          onClick={() => onDelete(sub, parentService.uuid)}
                          disabled={deleteLoading}
                          title="Delete Sub-service"
                        >
                          <Trash2Icon className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
