import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import { navigationItems } from "../../layouts/navigation";
import CustomDrawer from "../drawer";
import SidebarNavList from "./_components/sidebar-nav-list";
import LogoutButton from "../logout";
import { Tooltip } from "@mui/material";
import { shouldShowTooltip } from "../../common/shouldShowTooltip";

import { useAppSelector } from "../../store/hooks";
import type { RootState } from "../../store/store";

type SidebarProps = {
  drawerWidth: number;
  mobileOpen: boolean;
  onToggleSidebar: () => void;
  isDesktop: boolean;
};

const Sidebar = ({ drawerWidth, mobileOpen, onToggleSidebar, isDesktop }: SidebarProps) => {
  const { salon } = useAppSelector((state: RootState) => state.auth);
  const drawerContent = (
    <Box className="flex flex-col h-full">
      <Box className="border-b border-gray-200 p-3">
        <Stack direction="row" spacing={2} alignItems="center">
          <Box className="flex items-center justify-center w-10 h-10 rounded-full bg-(--primary-900)!">
            <ContentCutIcon className="text-white!" />
          </Box>
          <Box className="min-w-0 flex-1">
            <Tooltip title={salon?.owner_name || "Salon Manager"} disableHoverListener={!shouldShowTooltip(salon?.owner_name || "Salon Manager", "160px")}>
              <Typography variant="subtitle1" fontWeight={600} color="primary" className="truncate" sx={{ textTransform: "capitalize" }}>
                {salon?.owner_name || "Salon Manager"}
              </Typography>
            </Tooltip>
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
