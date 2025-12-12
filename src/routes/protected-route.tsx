import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

const ProtectedRoute = () => {
  const { isAuthenticated, salon } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!salon?.is_onboarded) {
    return <Navigate to="/salon-onboarding" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
