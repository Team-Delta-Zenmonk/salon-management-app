import { useAppSelector } from "@/store/hooks";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface UnProtectedRouteProps {
    redirectPath?: string;
    state?: any;
}

const UnProtectedRoute = ({ redirectPath = "/dashboard", state }: UnProtectedRouteProps) => {
    const { isAuthenticated } = useAppSelector((s) => s.auth);
    const location = useLocation();

    if (isAuthenticated) {
        return <Navigate to={redirectPath} state={state || { from: location.pathname }} replace />;
    }

    return <Outlet />;
};

export default UnProtectedRoute;
