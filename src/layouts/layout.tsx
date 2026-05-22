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

  const handleToggleSidebar = () => setMobileOpen((prev) => !prev);

  return (
    <Box className="flex h-screen bg-gray-50">
      <Sidebar
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        onToggleSidebar={handleToggleSidebar}
        isDesktop={isDesktop}
      />

      <Box component="main" className="flex flex-col flex-1 h-screen w-full">
        <Topbar onMenuClick={isDesktop ? undefined : handleToggleSidebar} />
        <Box className="flex-1 min-h-0 overflow-y-auto">
          <Container maxWidth="xl" className="py-6 flex flex-col h-full">
            <Outlet />
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;