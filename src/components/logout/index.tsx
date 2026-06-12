import { Button, CircularProgress, IconButton } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { persistor } from "../../store/store";
import { useState } from "react";
import { callSnack } from "../snackbar";
import { useAppDispatch } from "../../store/hooks";
import { logout } from "../../features/auth/auth.slice";

const LogoutButton = ({ isCollapsed }: { isCollapsed?: boolean }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    try {
      setIsLoading(true);
      persistor.purge();
      dispatch(logout());
      navigate("/login", { replace: true });
    } catch {
      callSnack("Error during logout", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCollapsed) {
    return (
      <IconButton color="error" onClick={handleLogout} disabled={isLoading} className="w-full h-10 rounded-xl bg-red-50 hover:bg-red-100">
        {isLoading ? <CircularProgress size={20} color="inherit" /> : <LogoutIcon className="text-red-600!" />}
      </IconButton>
    );
  }

  return (
    <Button
      variant="text"
      color="error"
      fullWidth
      startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LogoutIcon className="text-red-600!" />}
      onClick={handleLogout}
      className="flex-start border-2"
      disabled={isLoading}
      sx={{ justifyContent: 'flex-start' }}
    >
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
};

export default LogoutButton;
