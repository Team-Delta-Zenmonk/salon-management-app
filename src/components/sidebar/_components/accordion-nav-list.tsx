import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { navigationSections, type NavGroup, type NavSubItem, type NavSection } from "@/layouts/nav-sections";
import { cn } from "@/lib/utils";

type AccordionNavListProps = {
  isDesktop: boolean;
  desktopCollapsed?: boolean;
  onItemClick?: () => void;
};

export const AccordionNavList: React.FC<AccordionNavListProps> = ({
  isDesktop,
  desktopCollapsed = false,
  onItemClick,
}) => {
  const location = useLocation();
  const currentPathWithSearch = location.pathname + location.search;

  // Auto-expand group that contains active sub-path
  const findInitialOpenGroup = (): Record<string, boolean> => {
    const map: Record<string, boolean> = {};
    for (const section of navigationSections) {
      for (const item of section.items) {
        if (item.children) {
          const match = item.children.some(
            (c: NavSubItem) =>
              c.path === currentPathWithSearch ||
              c.path.split("?")[0] === location.pathname
          );
          if (match) map[item.id] = true;
        }
      }
    }
    return map;
  };

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(findInitialOpenGroup);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isSubItemActive = (subItem: NavSubItem) => {
    if (subItem.path.includes("?")) {
      return currentPathWithSearch === subItem.path;
    }
    return location.pathname === subItem.path && !location.search;
  };

  const isParentActive = (group: NavGroup) => {
    if (group.path) {
      return location.pathname === group.path;
    }
    return group.children?.some((child: NavSubItem) => isSubItemActive(child)) || false;
  };

  return (
    <nav className="flex flex-col gap-5 w-full">
      {navigationSections.map((section: NavSection) => (
        <div key={section.title} className="flex flex-col gap-1">
          {!desktopCollapsed && (
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              {section.title}
            </div>
          )}

          {section.items.map((item: NavGroup) => {
            const Icon = item.icon;
            const hasChildren = Boolean(item.children && item.children.length > 0);
            const isOpen = Boolean(openGroups[item.id]);
            const isGroupActive = isParentActive(item);

            // Direct link without children
            if (!hasChildren && item.path) {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  title={desktopCollapsed ? item.name : undefined}
                  onClick={isDesktop ? undefined : onItemClick}
                  className={cn(
                    "flex items-center rounded-xl transition-all w-full text-xs font-semibold overflow-hidden group relative",
                    desktopCollapsed ? "justify-center py-2.5 px-0" : "gap-2.5 px-3 py-2",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-105", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                  {!desktopCollapsed && (
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis flex-1">{item.name}</span>
                  )}
                </Link>
              );
            }

            // Accordion collapsible parent
            return (
              <div key={item.id} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => toggleGroup(item.id)}
                  title={desktopCollapsed ? item.name : undefined}
                  className={cn(
                    "flex items-center rounded-xl transition-all w-full text-xs font-semibold overflow-hidden group cursor-pointer",
                    desktopCollapsed ? "justify-center py-2.5 px-0" : "gap-2.5 px-3 py-2 justify-between",
                    isGroupActive
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={cn("h-4 w-4 shrink-0", isGroupActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                    {!desktopCollapsed && (
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
                    )}
                  </div>

                  {!desktopCollapsed && (
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-transform duration-200 text-muted-foreground",
                        isOpen && "rotate-180 text-foreground"
                      )}
                    />
                  )}
                </button>

                {/* Sub items collapsible */}
                {!desktopCollapsed && (
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="relative pl-6 pr-1 py-1.5 flex flex-col gap-1 ml-3 border-l-2 border-border/60">
                          {item.children?.map((subItem: NavSubItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = isSubItemActive(subItem);

                            return (
                              <Link
                                key={subItem.path}
                                to={subItem.path}
                                onClick={isDesktop ? undefined : onItemClick}
                                className={cn(
                                  "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group relative",
                                  isSubActive
                                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                              >
                                {SubIcon && <SubIcon className={cn("h-3.5 w-3.5 shrink-0", isSubActive ? "text-primary-foreground" : "text-muted-foreground/70 group-hover:text-foreground")} />}
                                <span className="truncate">{subItem.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </nav>
  );
};

export default AccordionNavList;
