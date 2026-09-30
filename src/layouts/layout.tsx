import React from "react";
import { Outlet } from "react-router-dom";
import { useMediaQuery } from "../hooks/use-media-query";
import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";
import SubscriptionLockoutModal from "../components/subscription-lockout-modal";

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
          <div className="w-full mx-auto py-3.5 sm:py-6 lg:py-8 flex flex-col min-h-full pl-4 pr-[calc(1rem-6px)] sm:pl-6 sm:pr-[calc(1.5rem-6px)] lg:pl-8 lg:pr-[calc(2rem-6px)]">
            <Outlet />
          </div>
        </div>
      </main>

      <SubscriptionLockoutModal />
    </div>
  );
};

export default Layout;