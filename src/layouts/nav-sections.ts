import React from "react";
import {
  LayoutDashboard,
  Scissors,
  CalendarDays,
  Users,
  Package,
  LayoutList,
  IndianRupee,
  Palette,
  CircleUser,
  CreditCard,
  Bell,
  Layers,
  History,
  Store,
  Boxes,
} from "lucide-react";

export type NavSubItem = {
  name: string;
  path: string;
  icon?: React.ElementType;
  badge?: string;
};

export type NavGroup = {
  id: string;
  name: string;
  icon: React.ElementType;
  path?: string;
  badge?: string;
  children?: NavSubItem[];
};

export type NavSection = {
  title: string;
  items: NavGroup[];
};

export const navigationSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        id: "dashboard",
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        id: "bookings",
        name: "Appointments",
        path: "/bookings",
        icon: CalendarDays,
      },
    ],
  },
  {
    title: "Catalog & Team",
    items: [
      {
        id: "services-menu",
        name: "Catalog & Services",
        icon: Scissors,
        children: [
          { name: "Categories", path: "/categories", icon: LayoutList },
          { name: "Services", path: "/services", icon: Scissors },
        ],
      },
      {
        id: "team-pricing",
        name: "Team & Pricing",
        icon: Users,
        children: [
          { name: "Staff Members", path: "/staff", icon: Users },
          { name: "Pricing by Staff", path: "/staff-service-pricing?view=staff", icon: IndianRupee },
          { name: "Pricing by Service", path: "/staff-service-pricing?view=service", icon: Layers },
        ],
      },
      {
        id: "inventory",
        name: "Inventory & Stock",
        icon: Package,
        children: [
          { name: "Stock Inventory", path: "/inventory?tab=stock", icon: Boxes },
          { name: "Stock History & Logs", path: "/inventory?tab=logs", icon: History },
        ],
      },
    ],
  },
  {
    title: "Branding & Storefront",
    items: [
      {
        id: "appearance",
        name: "Storefront Design",
        path: "/appearance",
        icon: Palette,
      },
    ],
  },
  {
    title: "Settings & Account",
    items: [
      {
        id: "account",
        name: "Salon Account",
        icon: Store,
        children: [
          { name: "Salon Profile", path: "/my-profile", icon: CircleUser },
          { name: "Plan & Billing", path: "/billing", icon: CreditCard },
        ],
      },
    ],
  },
];
