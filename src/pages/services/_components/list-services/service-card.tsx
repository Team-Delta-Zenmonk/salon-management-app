import { Edit2Icon, Trash2Icon, UserPlusIcon, Clock, PlusIcon } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { EllipsisCell } from "../../../../components/ellipse-cell";
import type { Service } from "../../../../features/service/service.slice";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service, parentUuid?: string) => void;
  onDelete: (service: Service, parentUuid?: string) => void;
  onAddSubService: (parentService: Service) => void;
  onAssignStaff: (service: Service) => void;
  onManageOptions: (service: Service) => void;
  deleteLoading: boolean;
  refreshTrigger?: number;
}

export function ServiceCard({
  service,
  onEdit,
  onDelete,
  onAddSubService,
  onAssignStaff,
  onManageOptions,
  deleteLoading,
}: Readonly<ServiceCardProps>) {
  const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      className={cn(
        "group relative bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 transition-all duration-300 flex flex-col justify-between h-full min-h-[220px] overflow-hidden"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div>
        <div className="flex items-start gap-3.5 relative z-10 w-full">
          <div className="relative shrink-0 mt-0.5">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Avatar className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ring-2 ring-primary/10 group-hover:border-primary/40 group-hover:shadow-lg transition-all duration-300 relative z-10 shrink-0 overflow-hidden">
              <AvatarImage
                src={service.logo || undefined}
                alt={service.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/5 text-primary font-bold text-base sm:text-lg rounded-2xl">
                {service.name ? service.name.charAt(0).toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="min-w-0 flex-1 flex flex-col gap-1">
            <EllipsisCell
              value={service.name}
              maxChars={100}
              className="font-bold text-foreground text-base sm:text-lg leading-tight group-hover:text-primary transition-colors block capitalize"
            />
            {service.description ? (
              <EllipsisCell
                value={service.description}
                maxChars={120}
                className="text-muted-foreground text-xs leading-relaxed line-clamp-2 mt-0.5"
              />
            ) : (
              <p className="text-muted-foreground/50 text-xs italic mt-0.5">
                No description provided.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 mt-4 pt-3 border-t border-border/30 relative z-10">
          <div className="flex flex-wrap gap-1.5 items-center">
            <Badge
              variant="outline"
              className="bg-muted/40 border-border/50 text-muted-foreground text-[10px] font-medium px-2 py-0.5 rounded-md uppercase tracking-wider"
            >
              {service.gender}
            </Badge>
            {service.is_popular && (
              <Badge className="bg-amber-500/10 text-amber-600 border-none text-[10px] font-semibold px-2 py-0.5 rounded-md hover:bg-amber-500/10">
                Popular
              </Badge>
            )}
            {!service.is_active && (
              <Badge
                variant="destructive"
                className="bg-destructive/10 text-destructive border-none text-[10px] font-semibold px-2 py-0.5 rounded-md hover:bg-destructive/10"
              >
                Inactive
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-0.5 bg-background/80 backdrop-blur-xs rounded-full p-1 border border-border/40 opacity-90 group-hover:opacity-100 transition-all duration-300 shadow-xs shrink-0 z-20">
            <Button
              variant="ghost"
              size="icon"
              className="h-7.5 w-7.5 sm:h-8 sm:w-8 rounded-full hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
              onClick={() => onAddSubService(service)}
              disabled={deleteLoading}
              title="Add Sub-service"
            >
              <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7.5 w-7.5 sm:h-8 sm:w-8 rounded-full hover:bg-green-500/10 hover:text-green-600 text-muted-foreground transition-colors"
              onClick={() => onAssignStaff(service)}
              disabled={deleteLoading}
              title="Assign Staff"
            >
              <UserPlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7.5 w-7.5 sm:h-8 sm:w-8 rounded-full hover:bg-purple-500/10 hover:text-purple-600 text-muted-foreground transition-colors"
              onClick={() => onEdit(service)}
              disabled={deleteLoading}
              title="Edit Service"
            >
              <Edit2Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7.5 w-7.5 sm:h-8 sm:w-8 rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
              onClick={() => onDelete(service)}
              disabled={deleteLoading}
              title="Delete Service"
            >
              <Trash2Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-3 relative z-10 w-full">
        <div className="flex flex-col min-w-0 shrink-0">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold whitespace-nowrap">
            Price ({service.price_type})
          </span>
          <span className="text-sm font-bold text-primary whitespace-nowrap">
            ₹{service.price}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {service.duration && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap shrink-0">
              <Clock className="w-3.5 h-3.5 opacity-60 shrink-0" />
              <span>{service.duration} min</span>
            </div>
          )}
          {service?.sub_services_count && service.sub_services_count > 0 ? <Button
            onClick={() => onManageOptions(service)}
            variant="default"
            className="rounded-full px-3.5 h-8.5 sm:h-9 text-xs font-semibold shadow-sm hover:shadow transition-all duration-300 shrink-0"
          >
            Manage Sub-services
          </Button> : <></>}
        </div>
      </div>
    </motion.div>
  );
}
