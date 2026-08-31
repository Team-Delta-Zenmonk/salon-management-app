import { useNavigate } from "react-router-dom";
import { persistor } from "../../store/store";
import { useState } from "react";
import { callSnack } from "../snackbar";
import { useAppDispatch } from "../../store/hooks";
import { logout } from "../../features/auth/auth.slice";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

interface LogoutButtonProps {
  iconOnly?: boolean;
}

const LogoutButton = ({ iconOnly = false }: LogoutButtonProps = {}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    try {
      setIsLoading(true);
      persistor.purge();
      dispatch(logout());
      navigate("/login", { replace: true });
    } catch {
      callSnack("Error during logout", "error");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowConfirmDialog(true)}
        disabled={isLoading}
        className={cn(
          "transition-all duration-300 font-semibold gap-2",
          iconOnly 
            ? "justify-center px-3 h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" 
            : "w-full justify-center px-4 h-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
        )}
        title={iconOnly ? "Logout" : undefined}
      >
        <LogOut className={cn(iconOnly ? "h-5 w-5" : "h-4 w-4")} />
        {!iconOnly && "Logout"}
      </Button>

      <Dialog open={showConfirmDialog} onOpenChange={(open) => !isLoading && setShowConfirmDialog(open)}>
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
              onClick={() => setShowConfirmDialog(false)}
              disabled={isLoading}
              className="rounded-full px-6"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleLogout}
              disabled={isLoading}
              className="rounded-full px-6 shadow-md hover:shadow-lg transition-shadow"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Logging out..." : "Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LogoutButton;
