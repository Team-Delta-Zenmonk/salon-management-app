import { CalendarClock, Users, CreditCard, TrendingUp } from "lucide-react";
import type { Variants } from "framer-motion";

export const STATIC_DASHBOARD_DATA = {
  stats: [
    { title: "Total Bookings", value: "156", change: "+12.5%", isPositive: true, icon: CalendarClock },
    { title: "Total Customers", value: "892", change: "+8.2%", isPositive: true, icon: Users },
    { title: "Revenue", value: "₹45,230", change: "+18.1%", isPositive: true, icon: CreditCard },
    { title: "Avg. Ticket Size", value: "₹290", change: "+4.3%", isPositive: true, icon: TrendingUp },
  ],
  serviceDistribution: [
    { name: "Haircuts & Styling", value: 45, color: "var(--primary)" },
    { name: "Coloring", value: 25, color: "#f59e0b" },
    { name: "Nails & Manicure", value: 18, color: "#10b981" },
    { name: "Facials & Makeup", value: 12, color: "var(--muted-foreground)" },
  ],
  staffPerformance: [
    { name: "Jessica Taylor", role: "Senior Stylist", bookings: 48, rating: "4.9", avatar: "JT" },
    { name: "David Smith", role: "Color Expert", bookings: 36, rating: "4.8", avatar: "DS" },
    { name: "Sophia Loren", role: "Nail Artist", bookings: 28, rating: "4.7", avatar: "SL" },
    { name: "Emma Watson", role: "Aesthetician", bookings: 22, rating: "4.9", avatar: "EW" },
  ],
};

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export const getTodayFormattedDate = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
