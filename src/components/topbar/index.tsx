import React, { useState } from "react";
import { Menu, Bell, CircleUser, LogOut, Loader2, CreditCard } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { RootState } from "../../store/store";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useMediaQuery } from "../../hooks/use-media-query";
import { ThemeToggle } from "../theme-toggle";
import NotificationDropdown from "./_components/notification-dropdown";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { persistor } from "../../store/store";
import { logout } from "../../features/auth/auth.slice";
import { callSnack } from "../snackbar";
import { EllipsisCell } from "../ellipse-cell";

type TopbarProps = {
  onMenuClick?: () => void;
};

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { salon } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isNotificationsActive = location.pathname === "/notifications";
  const isProfileActive = location.pathname === "/my-profile";

  const handleLogout = () => {
    try {
      setIsLoggingOut(true);
      persistor.purge();
      dispatch(logout());
      navigate("/login", { replace: true });
    } catch {
      callSnack("Error during logout", "error");
      setIsLoggingOut(false);
    }
  };

  const isSubscribed = salon?.subscription_status === "active";

  return (
    <header className="border-b border-border h-[72px] flex flex-col justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-30 sticky top-0">
      <div className="flex items-center justify-between px-4 w-full">
        <div className="flex items-center min-w-0 flex-1">
          {onMenuClick && (
            <button 
              onClick={onMenuClick} 
              className="mr-3 p-2 -ml-2 rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer" 
              aria-label="toggle sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          <div className="flex-1 min-w-0">
            <EllipsisCell
              value={salon?.name || "Salon Management Service"}
              maxChars={25}
              className="text-lg sm:text-xl font-bold tracking-tight text-foreground capitalize min-w-0 block"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <ThemeToggle />

          <NotificationDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex items-center justify-center h-10 w-10 rounded-full transition-all cursor-pointer outline-none shrink-0 p-0.5 relative group",
                isSubscribed
                  ? "ring-2 ring-amber-400 dark:ring-amber-300 ring-offset-2 ring-offset-background shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                  : isProfileActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/60 text-muted-foreground hover:text-foreground"
              )}
              title={isSubscribed ? `${salon?.name} (PRO Subscriber)` : "Profile Menu"}
            >
              <Avatar className={cn("h-full w-full rounded-full overflow-hidden border", isSubscribed ? "border-amber-400/60" : "border-border/40")}>
                <AvatarImage src={salon?.logo || "/management-icon.png"} alt={salon?.name || "Salon"} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-[11px]">
                  {salon?.name?.charAt(0).toUpperCase() || "S"}
                </AvatarFallback>
              </Avatar>
              {isSubscribed && (
                <span className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 font-black text-[9px] px-1 py-0.2 rounded-full border border-background shadow-xs flex items-center justify-center">
                  PRO
                </span>
              )}
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52 p-1.5 z-50">
              <DropdownMenuItem
                onClick={() => navigate("/my-profile")}
                className="cursor-pointer font-medium py-2 px-2.5 gap-2.5 rounded-lg"
              >
                <CircleUser className="w-4 h-4 text-muted-foreground" />
                <span>My Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => navigate("/billing")}
                className="cursor-pointer font-medium py-2 px-2.5 gap-2.5 rounded-lg"
              >
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span>Plan & Billing</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1" />

              <DropdownMenuItem
                onClick={() => setShowLogoutDialog(true)}
                variant="destructive"
                className="cursor-pointer font-medium py-2 px-2.5 gap-2.5 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Confirm Logout Dialog */}
          <Dialog open={showLogoutDialog} onOpenChange={(open) => !isLoggingOut && setShowLogoutDialog(open)}>
            <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl">
              <DialogHeader className="px-6 py-5 border-b bg-muted/20">
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">Confirm Logout</DialogTitle>
              </DialogHeader>

              <div className="py-6 px-6 text-sm text-muted-foreground">
                Are you sure you want to log out of your account?
              </div>

              <DialogFooter className="m-0 px-6 py-4 border-t bg-muted/10 gap-3 sm:gap-3 flex-row justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowLogoutDialog(false)}
                  disabled={isLoggingOut}
                  className="rounded-full px-6"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="rounded-full px-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  {isLoggingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
