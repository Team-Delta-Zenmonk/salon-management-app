import { useEffect, useState } from "react";
import { Edit2Icon, Trash2Icon, UserPlusIcon, Clock, PlusIcon } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { listSubServicesService } from "../../../../features/service/list-sub-services/list-sub-services.service";
import { callSnack } from "../../../../components/snackbar";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";

import type { Service } from "../../../../features/service/service.slice";

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service, parentUuid?: string) => void;
  onDelete: (service: Service, parentUuid?: string) => void;
  onAddSubService: (parentService: Service) => void;
  onAssignStaff: (service: Service) => void;
  onManageOptions: (service: Service) => void;
  deleteLoading: boolean;
  refreshTrigger: number;
}

export function ServiceCard({
  service,
  onEdit,
  onDelete,
  onAddSubService,
  onAssignStaff,
  onManageOptions,
  deleteLoading,
  refreshTrigger,
}: Readonly<ServiceCardProps>) {
  const [subServices, setSubServices] = useState<Service[]>([]);
  const [subLoading, setSubLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchSubServices = async () => {
      try {
        setSubLoading(true);
        const res = await listSubServicesService(service.uuid);
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
          setSubLoading(false);
        }
      }
    };
    fetchSubServices();
    return () => {
      isMounted = false;
    };
  }, [service.uuid, refreshTrigger]);

  const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const prices = subServices.map((s) => Number(s.price)).filter((p) => !isNaN(p));
  const minPrice = prices.length > 0 ? Math.min(...prices) : Number(service.price);
  const maxPrice = prices.length > 0 ? Math.max(...prices) : Number(service.price);
  const priceRangeString = prices.length > 0
    ? (minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`)
    : `₹${service.price}`;

  const subServicesNames = subServices.map((s) => s.name).join(", ");
  const hasSubServices = !subLoading && subServices.length > 0;

  return (
    <motion.div
      variants={cardVariants}
      className="group relative bg-card/60 backdrop-blur-md border border-border/50 rounded-3xl p-6 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 transition-all duration-300 flex flex-col justify-between h-full min-h-[250px] overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div>
        <div className="flex gap-4 items-start relative z-10">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Avatar className="w-14 h-14 rounded-2xl ring-2 ring-primary/10 group-hover:border-primary/40 group-hover:shadow-lg transition-all duration-300 relative z-10 shrink-0 overflow-hidden">
              <AvatarImage src={service.logo || undefined} alt={service.name} className="object-cover" />
              <AvatarFallback className="bg-primary/5 text-primary font-bold text-lg rounded-2xl">
                {service.name ? service.name.charAt(0).toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0 pr-24">
            <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors truncate">
              {service.name}
            </h3>
            {service.description ? (
              <p className="text-muted-foreground text-xs mt-1.5 line-clamp-2">
                {service.description}
              </p>
            ) : (
              <p className="text-muted-foreground/50 text-xs mt-1.5 italic">
                No description provided.
              </p>
            )}
          </div>
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-0.5 bg-background/80 backdrop-blur-xs rounded-full p-1 border border-border/30 opacity-80 group-hover:opacity-100 transition-all duration-300 shadow-sm z-20">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
            onClick={() => onAddSubService(service)}
            disabled={deleteLoading}
            title="Add Sub-service"
          >
            <PlusIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-green-500/10 hover:text-green-600 text-muted-foreground transition-colors"
            onClick={() => onAssignStaff(service)}
            disabled={deleteLoading}
            title="Assign Staff"
          >
            <UserPlusIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-purple-500/10 hover:text-purple-600 text-muted-foreground transition-colors"
            onClick={() => onEdit(service)}
            disabled={deleteLoading}
            title="Edit Service"
          >
            <Edit2Icon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
            onClick={() => onDelete(service)}
            disabled={deleteLoading}
            title="Delete Service"
          >
            <Trash2Icon className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 items-center relative z-10">
          <Badge variant="outline" className="bg-muted/40 border-border/40 text-muted-foreground text-[10px] font-medium px-2 py-0.5 rounded-md uppercase tracking-wider">
            {service.gender}
          </Badge>
          {hasSubServices && (
            <Badge className="bg-primary/10 text-primary border-none text-[10px] font-semibold px-2 py-0.5 rounded-md hover:bg-primary/10">
              {subServices.length} Sub-services
            </Badge>
          )}
          {service.is_popular && (
            <Badge className="bg-amber-500/10 text-amber-600 border-none text-[10px] font-semibold px-2 py-0.5 rounded-md hover:bg-amber-500/10">
              Popular
            </Badge>
          )}
          {!service.is_active && (
            <Badge variant="destructive" className="bg-destructive/10 text-destructive border-none text-[10px] font-semibold px-2 py-0.5 rounded-md hover:bg-destructive/10">
              Inactive
            </Badge>
          )}
        </div>

        {hasSubServices && (
          <div className="mt-4 relative z-10">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Sub-services</div>
            <div className="flex items-center gap-3 bg-primary/5 border border-primary/10 rounded-2xl p-2.5">
              <div className="flex -space-x-2.5 overflow-hidden shrink-0">
                {subServices.slice(0, 4).map((sub) => (
                  <Avatar
                    key={sub.uuid}
                    className="w-7 h-7 rounded-full ring-2 ring-background border border-primary/20 overflow-hidden shrink-0"
                  >
                    <AvatarImage src={sub.logo || undefined} alt={sub.name} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-[9px] flex items-center justify-center">
                      {sub.name ? sub.name.charAt(0).toUpperCase() : "?"}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {subServices.length > 4 && (
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/15 text-primary text-[9px] font-bold ring-2 ring-background border border-primary/20 shrink-0">
                    +{subServices.length - 4}
                  </div>
                )}
              </div>
              
              <div className="text-[11px] font-medium text-foreground truncate flex-1 min-w-0 pr-1">
                {subServicesNames}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between gap-4 relative z-10">
        {hasSubServices ? (
          <>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Price Range</span>
              <span className="text-sm font-bold text-primary">{priceRangeString}</span>
            </div>
            <Button
              onClick={() => onManageOptions(service)}
              className="rounded-full px-4 h-9 text-xs font-semibold shadow-sm hover:shadow transition-all duration-300"
            >
              Manage Sub-services
            </Button>
          </>
        ) : (
          <>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                Price ({service.price_type})
              </span>
              <span className="text-sm font-bold text-primary">₹{service.price}</span>
            </div>
            {service.duration && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5 opacity-60" />
                <span>{service.duration} min</span>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
