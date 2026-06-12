import React from "react";
import { Outlet } from "react-router-dom";
import { Box, useMediaQuery, useTheme, Container } from "@mui/material";
import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";

const drawerWidth = 260;

const Layout = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [desktopOpen, setDesktopOpen] = React.useState(false); // start closed by default as in mini-variant

  const handleToggleSidebar = () => {
    if (isDesktop) {
      setDesktopOpen((prev) => !prev);
    } else {
      setMobileOpen((prev) => !prev);
    }
  };

  return (
    <Box className="flex h-screen bg-[var(--background)]">
      <Sidebar
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        desktopOpen={desktopOpen}
        onToggleSidebar={handleToggleSidebar}
        isDesktop={isDesktop}
      />

      <Box component="main" className="flex flex-col flex-1 h-screen w-full">
        <Topbar onMenuClick={handleToggleSidebar} />
        <Box className="flex-1 min-h-0 overflow-y-auto flex flex-col">
          <Box className="p-4 md:p-8 flex flex-col flex-1 w-full">
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;