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
import Layout from "../layouts/layout";
import Inventory from "../pages/inventory";
import Category from "../pages/category";
import Services from "../pages/services";
import Staff from "../pages/staff";
import Offers from "../pages/offers";
import Customers from "../pages/customers";
import Reports from "../pages/reports";
import Notification from "../pages/notification";
import Bookings from "../pages/bookings";
import StaffServiceManagementPage from "../pages/pricing";

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
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/inventory" element={<Inventory/>} />
          <Route path="/categories" element={<Category/>} />
          <Route path="/services" element={<Services/>} />
          <Route path="/bookings" element={<Bookings/>} />
          <Route path="/staff" element={<Staff/>} />
          <Route path="/staff-service-pricing" element={<StaffServiceManagementPage/>} />
          <Route path="/offers" element={<Offers/>} />
          <Route path="/customers" element={<Customers/>} />
          <Route path="/reports" element={<Reports/>} />
          <Route path="/notifications" element={<Notification/>} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AllRoutes;
