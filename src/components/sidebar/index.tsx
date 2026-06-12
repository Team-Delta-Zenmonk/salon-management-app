import React, { useState } from "react";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import { navigationItems } from "../../layouts/navigation";
import CustomDrawer from "../drawer";
import SidebarNavList from "./_components/sidebar-nav-list";
import LogoutButton from "../logout";
import { Box, Typography, Stack, Tooltip, Drawer } from "@mui/material";
import { shouldShowTooltip } from "../../common/shouldShowTooltip";

import { useAppSelector } from "../../store/hooks";
import type { RootState } from "../../store/store";

type SidebarProps = {
  drawerWidth: number;
  mobileOpen: boolean;
  desktopOpen?: boolean;
  onToggleSidebar: () => void;
  isDesktop: boolean;
};

const Sidebar = ({ drawerWidth, mobileOpen, desktopOpen = false, onToggleSidebar, isDesktop }: SidebarProps) => {
  const { salon } = useAppSelector((state: RootState) => state.auth);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const collapsedWidth = 88;
  const currentWidth = isDesktop ? (desktopOpen ? drawerWidth : collapsedWidth) : drawerWidth;
  const isCollapsed = isDesktop && !desktopOpen;

  const drawerContent = (
    <Box 
      className="flex flex-col h-full bg-[var(--surface)] border-r border-[var(--border-subtle)] overflow-hidden"
      sx={{ width: currentWidth, transition: 'width 0.3s ease' }}
    >
      <Box className="h-[72px] flex items-center px-6 shrink-0">
        <Stack direction="row" spacing={3} alignItems="center" className="w-full">
          <Box className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-[var(--primary-900)] shadow-sm">
            <ContentCutIcon className="text-white!" fontSize="small" />
          </Box>
          <Box className="min-w-0 flex-1" sx={{ opacity: isCollapsed ? 0 : 1, transition: 'opacity 0.2s', whiteSpace: 'nowrap' }}>
            <Tooltip title={salon?.owner_name || "Salon Manager"} open={tooltipOpen && !isCollapsed} onClose={() => setTooltipOpen(false)} disableHoverListener>
              <Typography
                onMouseEnter={(e) => {
                  if (shouldShowTooltip(e.currentTarget)) setTooltipOpen(true);
                }}
                onMouseLeave={() => setTooltipOpen(false)}
                variant="subtitle2" fontWeight={600} className="text-[var(--text-primary)] truncate" sx={{ textTransform: "capitalize" }}
              >
                {salon?.owner_name || "Salon Manager"}
              </Typography>
            </Tooltip>
          </Box>
        </Stack>
      </Box>
      <Box className="flex-1 overflow-y-auto px-4 py-6 overflow-x-hidden">
        <SidebarNavList items={navigationItems} isDesktop={isDesktop} onItemClick={onToggleSidebar} isCollapsed={isCollapsed} />
      </Box>
      <Box className="border-t border-[var(--border-subtle)] p-4">
        <LogoutButton isCollapsed={isCollapsed} />
      </Box>
    </Box>
  );

  return (
    <>
      {!isDesktop && (
        <CustomDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={onToggleSidebar}
          width={drawerWidth}
          showOn={{ xs: true, md: false }}
        >
          {drawerContent}
        </CustomDrawer>
      )}
      {isDesktop && (
        <Drawer
          variant="permanent"
          sx={{
            width: currentWidth,
            transition: 'width 0.3s ease',
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: currentWidth,
              transition: 'width 0.3s ease',
              overflowX: 'hidden',
              boxSizing: 'border-box',
              borderRight: 'none',
              backgroundColor: 'transparent'
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
