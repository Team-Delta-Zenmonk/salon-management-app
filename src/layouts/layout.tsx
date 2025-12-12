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

  const handleToggleSidebar = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <Box className="flex min-h-screen bg-gray-50">
      <Sidebar
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        onToggleSidebar={handleToggleSidebar}
        isDesktop={isDesktop}
      />
      <Box component="main" className="flex flex-col flex-1 min-h-screen">
        <Topbar onMenuClick={!isDesktop ? handleToggleSidebar : undefined} />
        <Container maxWidth="xl" className=" py-6">
          <Outlet  />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
