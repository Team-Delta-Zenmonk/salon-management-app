import React, { useState } from "react";
import { Menu, LogOut, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../store/store";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { ThemeToggle } from "../theme-toggle";
import NotificationDropdown from "./_components/notification-dropdown";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { persistor } from "../../store/store";
import { logout } from "../../features/auth/auth.slice";
import { callSnack } from "../snackbar";
import { EllipsisCell } from "../ellipse-cell";

type TopbarProps = {
  onMenuClick?: () => void;
};

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { salon } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-4">
          <ThemeToggle />

          <NotificationDropdown />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLogoutDialog(true)}
            className="rounded-lg gap-1.5 text-xs text-foreground hover:text-destructive cursor-pointer"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>

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
                  className="rounded-full px-6 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="rounded-full px-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
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
