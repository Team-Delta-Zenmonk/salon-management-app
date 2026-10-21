import React from "react";
import { motion } from "framer-motion";
import { AccordionNavList } from "./_components/accordion-nav-list";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

import { useAppSelector } from "../../store/hooks";
import type { RootState } from "../../store/store";
import { EllipsisCell } from "../ellipse-cell";
import { APP_NAME } from "@/constants/app";

type SidebarProps = {
  drawerWidth: number;
  mobileOpen: boolean;
  desktopCollapsed?: boolean;
  onToggleSidebar: () => void;
  isDesktop: boolean;
};

const Sidebar = ({ drawerWidth, mobileOpen, desktopCollapsed = false, onToggleSidebar, isDesktop }: SidebarProps) => {
  const { salon } = useAppSelector((state: RootState) => state.auth);

  const drawerContent = (
    <div className="flex flex-col h-full bg-card">
      <div className={cn("border-b border-border h-[72px] flex items-center shrink-0", desktopCollapsed ? "justify-center px-0" : "pl-4 pr-6")}>
        <div className={cn("flex items-center", desktopCollapsed ? "justify-center" : "space-x-3 w-full")}>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 overflow-hidden shrink-0 shadow-xs border border-border/50">
            <img
              src={salon?.logo || "/management-icon.png"}
              alt={salon?.name || "Salon Logo"}
              className="w-full h-full object-cover"
            />
          </div>
          {!desktopCollapsed && (
            <div className="min-w-0 flex-1">
              <EllipsisCell
                value={salon?.name || APP_NAME}
                maxChars={18}
                className="text-sm font-bold text-foreground capitalize block"
              />
              <span className="text-[10px] text-muted-foreground block leading-none mt-1">
                Workspace Console
              </span>
            </div>
          )}
        </div>
      </div>
      <div className={cn("flex-1 overflow-y-auto", desktopCollapsed ? "px-2 py-3" : "p-3")}>
        <AccordionNavList isDesktop={isDesktop} desktopCollapsed={desktopCollapsed} onItemClick={onToggleSidebar} />
      </div>
    </div>
  );

  return (
    <>
      {!isDesktop && (
        <Sheet open={mobileOpen} onOpenChange={onToggleSidebar}>
          <SheetContent side="left" className="p-0 border-r-border w-[280px]">
            {drawerContent}
          </SheetContent>
        </Sheet>
      )}

      {isDesktop && (
        <motion.aside 
          initial={false}
          animate={{ 
            width: desktopCollapsed ? 80 : drawerWidth
          }}
          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          className="flex-shrink-0 border-r border-border bg-card shadow-sm overflow-hidden"
        >
          {drawerContent}
        </motion.aside>
      )}
    </>
  );
};

export default Sidebar;
