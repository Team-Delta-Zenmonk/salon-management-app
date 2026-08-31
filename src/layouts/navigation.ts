import {
  LayoutDashboard,
  Scissors,
  CalendarDays,
  Users,
  Tag,
  User,
  Package,
  BarChart,
  Bell,
  LayoutList,
  IndianRupee,
  CircleUser,
  Palette
} from "lucide-react";

export type NavItem = {
  name: string;
  path: string;
  icon: React.ElementType;
};

export const navigationItems: NavItem[] = [
  { name: "My Profile", path: "/my-profile", icon: CircleUser },
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Categories", path: "/categories", icon: LayoutList },
  { name: "Services", path: "/services", icon: Scissors },
  { name: "Bookings", path: "/bookings", icon: CalendarDays },
  { name: "Staff", path: "/staff", icon: Users },
  { name: "Pricing", path: "/staff-service-pricing", icon: IndianRupee },
  { name: "Offers", path: "/offers", icon: Tag },
  { name: "Customers", path: "/customers", icon: User },
  { name: "Inventory", path: "/inventory", icon: Package },
  { name: "Reports", path: "/reports", icon: BarChart },
  { name: "Notifications", path: "/notifications", icon: Bell },
  { name: "Appearance", path: "/appearance", icon: Palette },
];
