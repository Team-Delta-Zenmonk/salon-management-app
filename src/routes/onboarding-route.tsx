import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

const OnboardingRoute = () => {
  const { isAuthenticated, isOnboardingComplete } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isOnboardingComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default OnboardingRoute;
