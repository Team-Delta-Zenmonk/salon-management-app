import {
  LayoutDashboard,
  Scissors,
  CalendarDays,
  Users,
  Package,
  LayoutList,
  IndianRupee,
  CircleUser,
  Palette,
  CreditCard
} from "lucide-react";

export type NavItem = {
  name: string;
  path: string;
  icon: React.ElementType;
};

export const navigationItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Categories", path: "/categories", icon: LayoutList },
  { name: "Services", path: "/services", icon: Scissors },
  { name: "Staff", path: "/staff", icon: Users },
  { name: "Pricing", path: "/staff-service-pricing", icon: IndianRupee },
  { name: "Bookings", path: "/bookings", icon: CalendarDays },
  { name: "Inventory", path: "/inventory", icon: Package },
  { name: "Appearance", path: "/appearance", icon: Palette },
  { name: "Plan & Billing", path: "/billing", icon: CreditCard },
];
