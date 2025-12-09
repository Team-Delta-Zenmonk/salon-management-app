import { Route, Routes } from "react-router-dom";
import Login from "../pages/login";
import SignUp from "../pages/signup";
import ForgotPassword from "../pages/forgot-password";
import VerifyEmail from "../pages/verify-email";
import Dashboard from "../pages/dashboard";
import ResetPassword from "../pages/reset-password";
import SalonOnboarding from "../pages/salon-onboarding";

function AllRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/salon-onboarding" element={<SalonOnboarding/>} />
      </Routes>
    </>
  );
}

export default AllRoutes;
