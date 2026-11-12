import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { SUBSCRIPTION_STATUS } from "../common/enums/subscription-status.enum";
import { getSalonProfileAction } from "../features/auth/profile/get-salon-profile/getSalonProfile.action";
import { setSalonSuspended } from "../features/auth/auth.slice";
import { APP_NAME } from "../constants/app";
import { setAppSuspended } from "../components/snackbar";

const ProtectedRoute = () => {
  const { isAuthenticated, salon } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const appName = APP_NAME.toLowerCase();

  const isSuspended =
    salon?.subscription_status === SUBSCRIPTION_STATUS.SUSPENDED ||
    salon?.is_active === false;

  useEffect(() => {
    setAppSuspended(Boolean(isSuspended));
  }, [isSuspended]);

  useEffect(() => {
    if (isAuthenticated && salon?.uuid) {
      dispatch(getSalonProfileAction(salon.uuid));
    }
  }, [dispatch, isAuthenticated, salon?.uuid]);

  useEffect(() => {
    const handleAccountSuspended = () => {
      setAppSuspended(true);
      dispatch(setSalonSuspended());
    };
    window.addEventListener(`${appName}:account-suspended`, handleAccountSuspended);
    return () => {
      window.removeEventListener(`${appName}:account-suspended`, handleAccountSuspended);
    };
  }, [dispatch, appName]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isSuspended) {
    if (location.pathname !== "/suspended") {
      return <Navigate to="/suspended" replace />;
    }
    return <Outlet />;
  }

  if (location.pathname === "/suspended") {
    return <Navigate to="/dashboard" replace />;
  }

  if (!salon?.is_onboarded) {
    return <Navigate to="/salon-onboarding" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
