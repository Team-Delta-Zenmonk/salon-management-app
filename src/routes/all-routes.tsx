import { Route, Routes } from "react-router-dom";
import Login from "../pages/login";
import SignUp from "../pages/signup";
import ForgotPassword from "../pages/forgot-password";
import VerifyEmail from "../pages/verify-salon";
import Dashboard from "../pages/dashboard";
import ResetPassword from "../pages/reset-password";
import SalonOnboarding from "../pages/salon-onboarding";
import ProtectedRoute from "./protected-route";
import OnboardingRoute from "./onboarding-route";
import Unauthorized from "../components/unauthorized";

function AllRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-salon" element={<VerifyEmail />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      <Route element={<OnboardingRoute />}>
        <Route path="/salon-onboarding" element={<SalonOnboarding />} />
      </Route>
      
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default AllRoutes;