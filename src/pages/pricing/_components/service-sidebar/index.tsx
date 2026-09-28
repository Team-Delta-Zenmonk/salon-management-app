import clsx from "clsx";
import type { ServiceType } from "../../types/staff-service.types";
import { Layers } from "lucide-react";
import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { EllipsisCell } from "@/components/ellipse-cell";

interface ServiceSideBarProps {
  services: ServiceType[];
  selectedServiceUuid: string | null;
  onSelectService: (uuid: string) => void;
  onExpandParent?: (uuid: string) => Promise<void> | void;
  loadingMap?: Record<string, boolean>;
  isLoading?: boolean;
}

export default function ServiceSidebar({
  services,
  selectedServiceUuid,
  onSelectService,
  isLoading,
}: Readonly<ServiceSideBarProps>) {
  useEffect(() => {
    if (services.length > 0 && !selectedServiceUuid) {
      onSelectService(services[0].uuid);
    }
  }, [services, selectedServiceUuid, onSelectService]);

  return (
    <div className="h-full flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
          Services
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Select a main service to manage its assigned staff.
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-5 custom-scrollbar">
        <div className="flex flex-col gap-2 mt-1">
          {isLoading ? (
            <div className="flex flex-col gap-2.5 pt-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3.5 p-3.5 rounded-xl border border-border/40 bg-card/40 animate-pulse"
                >
                  <div className="w-10 h-10 rounded-full bg-foreground/10 shrink-0" />
                  <div className="flex-1 space-y-2 py-0.5">
                    <div className="h-3.5 bg-foreground/10 rounded w-2/3" />
                    <div className="h-3 bg-foreground/10 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {services.map((s, idx) => {
                const isSelected = selectedServiceUuid === s.uuid;

                return (
                  <motion.div
                    key={s.uuid}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.04 }}
                    className={clsx(
                      "flex items-center gap-3.5 p-3.5 rounded-xl cursor-pointer border transition-all duration-200 relative overflow-hidden group",
                      isSelected
                        ? "bg-primary/10 border-primary/40 shadow-[0_2px_8px_rgba(var(--primary),0.08)]"
                        : "bg-card/60 backdrop-blur-md border-border/50 hover:bg-card/80 hover:border-border/80",
                    )}
                    onClick={() => onSelectService(s.uuid)}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeServiceIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}

                    <Avatar
                      className={clsx(
                        "w-10 h-10 text-sm border-2 transition-transform duration-200 group-hover:scale-105",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted text-muted-foreground",
                      )}
                    >
                      {s.logo ? (
                        <AvatarImage src={s.logo} alt={s.name} />
                      ) : (
                        <AvatarFallback className={clsx("bg-transparent", isSelected ? "text-primary" : "text-muted-foreground")}>
                          <Layers className="h-5 w-5" />
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <EllipsisCell
                        value={s.name}
                        className={clsx("text-sm transition-colors capitalize block", isSelected ? "font-bold text-foreground" : "font-medium text-foreground/90 group-hover:text-foreground")}
                      />
                      <p className="text-xs text-muted-foreground/80 mt-0.5">
                        Base: ₹{s.price ?? "-"} · {s.duration ?? "-"}m
                      </p>
                    </div>
                  </motion.div>
                );
              })}

              {services.length === 0 && (
                <div className="border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground text-sm mt-2 bg-muted/20">
                  No services available.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

