import { Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { persistor } from "../../store/store";
import { useState } from "react";
import { callSnack } from "../snackbar";
import { useAppDispatch } from "../../store/hooks";
import { logout } from "../../features/auth/auth.slice";

const LoginButton = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    try {
      setIsLoading(true);
      persistor.purge();
      dispatch(logout())
      navigate("/login", { replace: true });
    } catch {
      callSnack("Error during logout", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="text"
      color="error"
      fullWidth
      startIcon={<LogoutIcon className="text-red-600!" />}
      onClick={handleLogout}
      className="flex-start border-2"
    >
      Logout
    </Button>
  );
};

export default LoginButton;
