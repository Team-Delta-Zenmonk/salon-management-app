import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import { navigationItems } from "../../layouts/navigation";
import CustomDrawer from "../drawer";
import SidebarNavList from "./_components/sidebar-nav-list";
import LogoutButton from "../logout";

type SidebarProps = {
  drawerWidth: number;
  mobileOpen: boolean;
  onToggleSidebar: () => void;
  isDesktop: boolean;
};

const Sidebar = ({ drawerWidth, mobileOpen, onToggleSidebar, isDesktop }: SidebarProps) => {
  const drawerContent = (
    <Box className="flex flex-col h-full">
      <Box className="border-b border-gray-200 p-3">
        <Stack direction="row" spacing={2} alignItems="center">
          <Box className="flex items-center justify-center w-10 h-10 rounded-full bg-(--primary-900)!">
            <ContentCutIcon className="text-white!" />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} color="primary">
              Salon Manager
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Admin Panel
            </Typography>
          </Box>
        </Stack>
      </Box>
      <Box className="flex-1 overflow-y-auto p-3">
        <SidebarNavList items={navigationItems} isDesktop={isDesktop} onItemClick={onToggleSidebar} />
      </Box>
      <Box className="border-t border-gray-200 p-4 ">
        <LogoutButton />
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
        <CustomDrawer
          variant="permanent"
          open
          onClose={onToggleSidebar}
          width={drawerWidth}
          showOn={{ xs: false, md: true }}
        >
          {drawerContent}
        </CustomDrawer>
      )}
    </>
  );
};

export default Sidebar;
