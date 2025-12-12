import type { ElementType, ReactElement } from "react";
import { List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import clsx from "clsx";

type NavItem = {
  name: string;
  path: string;
  icon: ElementType;
};

type SidebarNavListProps = {
  items: NavItem[];
  isDesktop: boolean;
  onItemClick?: () => void;
};

function SidebarNavList({ items, isDesktop, onItemClick }: SidebarNavListProps): ReactElement {
  const location = useLocation();

  return (
    <List disablePadding>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <ListItemButton
            key={item.path}
            component={RouterLink}
            to={item.path}
            onClick={!isDesktop ? onItemClick : undefined}
            selected={isActive}
            className={clsx("mb-1! rounded-lg!", isActive ? "bg-(--primary-900)! text-white!" : "hover:bg-gray-100")}
          >
            <ListItemIcon className={clsx("min-w-9!", isActive && "[&>svg]:text-white!")}>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItemButton>
        );
      })}
    </List>
  );
}

export default SidebarNavList;
