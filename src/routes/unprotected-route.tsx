import { useAppSelector } from "@/store/hooks";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { SUBSCRIPTION_STATUS } from "@/common/enums/subscription-status.enum";

interface UnProtectedRouteProps {
    redirectPath?: string;
    state?: any;
}

const UnProtectedRoute = ({ redirectPath = "/dashboard", state }: UnProtectedRouteProps) => {
    const { isAuthenticated, salon } = useAppSelector((s) => s.auth);
    const location = useLocation();

    if (isAuthenticated) {
        const isSuspended =
          salon?.subscription_status === SUBSCRIPTION_STATUS.SUSPENDED ||
          salon?.is_active === false;

        if (isSuspended) {
          return <Navigate to="/suspended" replace />;
        }
        return <Navigate to={redirectPath} state={state || { from: location.pathname }} replace />;
    }

    return <Outlet />;
};

export default UnProtectedRoute;
