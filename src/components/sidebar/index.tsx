import React from "react";
import { motion } from "framer-motion";
import { Scissors } from "lucide-react";
import { navigationItems } from "../../layouts/navigation";
import SidebarNavList from "./_components/sidebar-nav-list";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

import { useAppSelector } from "../../store/hooks";
import type { RootState } from "../../store/store";

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
      <div className={cn("border-b border-border h-[72px] flex items-center shrink-0", desktopCollapsed ? "justify-center px-0" : "px-4")}>
        <div className={cn("flex items-center", desktopCollapsed ? "justify-center" : "space-x-3 w-full")}>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary shrink-0 shadow-sm">
            <Scissors className="text-primary-foreground w-5 h-5" />
          </div>
          {!desktopCollapsed && (
            <div className="min-w-0 flex-1">
              <div 
                title={salon?.owner_name || "Salon Manager"}
                className="truncate text-base font-semibold text-foreground capitalize"
              >
                {salon?.owner_name || "Salon Manager"}
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                Admin Panel
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={cn("flex-1 overflow-y-auto", desktopCollapsed ? "px-2 py-3" : "p-3")}>
        <SidebarNavList items={navigationItems} isDesktop={isDesktop} desktopCollapsed={desktopCollapsed} onItemClick={onToggleSidebar} />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer */}
      {!isDesktop && (
        <Sheet open={mobileOpen} onOpenChange={onToggleSidebar}>
          <SheetContent side="left" className="p-0 border-r-border w-[280px]">
            {drawerContent}
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop Sidebar */}
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
