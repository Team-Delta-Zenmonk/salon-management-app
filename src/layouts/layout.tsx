import React from "react";
import { Outlet } from "react-router-dom";
import { useMediaQuery } from "../hooks/use-media-query";
import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";

const drawerWidth = 260;

const Layout = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = React.useState(false);

  const handleToggleSidebar = () => {
    if (isDesktop) {
      setDesktopCollapsed((prev) => !prev);
    } else {
      setMobileOpen((prev) => !prev);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        desktopCollapsed={desktopCollapsed}
        onToggleSidebar={handleToggleSidebar}
        isDesktop={isDesktop}
      />

      <main className="flex flex-col flex-1 h-screen min-w-0">
        <Topbar onMenuClick={handleToggleSidebar} />
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="w-full mx-auto py-6 flex flex-col h-full px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;