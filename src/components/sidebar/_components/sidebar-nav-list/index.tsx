import type { ElementType, ReactElement } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

type NavItem = {
  name: string;
  path: string;
  icon: ElementType;
};

type SidebarNavListProps = {
  items: NavItem[];
  isDesktop: boolean;
  desktopCollapsed?: boolean;
  onItemClick?: () => void;
};

function SidebarNavList({ items, isDesktop, desktopCollapsed = false, onItemClick }: Readonly<SidebarNavListProps>): ReactElement {
  const location = useLocation();

  return (
    <nav className="flex flex-col gap-1 w-full">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <RouterLink
            key={item.path}
            to={item.path}
            title={desktopCollapsed ? item.name : undefined}
            onClick={isDesktop ? undefined : onItemClick}
            className={cn(
              "flex items-center rounded-md transition-colors w-full text-sm font-medium overflow-hidden",
              desktopCollapsed ? "justify-center py-3 px-0" : "gap-3 px-3 py-2",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!desktopCollapsed && (
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
            )}
          </RouterLink>
        );
      })}
    </nav>
  );
}

export default SidebarNavList;
