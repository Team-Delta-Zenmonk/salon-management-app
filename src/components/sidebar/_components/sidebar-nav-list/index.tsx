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
  isCollapsed?: boolean;
};

import { Tooltip } from "@mui/material";

function SidebarNavList({ items, isDesktop, onItemClick, isCollapsed }: Readonly<SidebarNavListProps>): ReactElement {
  const location = useLocation();

  return (
    <List disablePadding>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        const button = (
          <ListItemButton
            component={RouterLink}
            to={item.path}
            onClick={isDesktop ? undefined : onItemClick}
            selected={isActive}
            className={clsx(
              "mb-1.5! rounded-xl! transition-all duration-200",
              isActive ? "bg-[var(--primary-900)]! text-white!" : "text-[var(--text-muted)]! hover:bg-[var(--surface-muted)]! hover:text-[var(--text-primary)]!",
              isCollapsed && "justify-center! px-0!"
            )}
            sx={{ minHeight: 48 }}
          >
            <ListItemIcon className={clsx("min-w-0!", isActive ? "[&>svg]:text-white!" : "[&>svg]:text-[var(--text-muted)]!", isCollapsed ? "mx-auto" : "mr-4")}>
              <Icon fontSize="small" />
            </ListItemIcon>
            {!isCollapsed && (
              <ListItemText primary={item.name} primaryTypographyProps={{ fontSize: "14px", fontWeight: isActive ? 600 : 500, whiteSpace: 'nowrap' }} />
            )}
          </ListItemButton>
        );

        return (
          <div key={item.path}>
            {isCollapsed ? (
              <Tooltip 
                title={item.name} 
                placement="right" 
                arrow
                slotProps={{
                  tooltip: {
                    sx: {
                      bgcolor: 'white',
                      color: 'black',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                      fontSize: '13px',
                      fontWeight: 500,
                      px: 1.5,
                      py: 1,
                      border: '1px solid var(--border-subtle)'
                    }
                  },
                  arrow: {
                    sx: {
                      color: 'white',
                      '&::before': {
                        border: '1px solid var(--border-subtle)'
                      }
                    }
                  }
                }}
              >
                {button}
              </Tooltip>
            ) : (
              button
            )}
          </div>
        );
      })}
    </List>
  );
}

export default SidebarNavList;
