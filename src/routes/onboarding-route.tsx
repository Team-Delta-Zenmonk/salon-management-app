import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

const OnboardingRoute = () => {
  const { isAuthenticated, salon } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (salon?.is_onboarded) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default OnboardingRoute;
