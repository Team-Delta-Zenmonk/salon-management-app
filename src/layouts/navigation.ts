import DashboardIcon from "@mui/icons-material/Dashboard";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import EventNoteIcon from "@mui/icons-material/EventNote";
import PeopleIcon from "@mui/icons-material/People";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import BarChartIcon from "@mui/icons-material/BarChart";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export type NavItem = {
  name: string;
  path: string;
  icon: React.ElementType;
};

export const navigationItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: DashboardIcon },
  { name: "Categories", path: "/categories", icon: CategoryOutlinedIcon },
  { name: "Services", path: "/services", icon: DesignServicesIcon },
  { name: "Bookings", path: "/bookings", icon: EventNoteIcon },
  { name: "Staff", path: "/staff", icon: PeopleIcon },
  { name: "Pricing", path: "/staff-service-pricing", icon: CurrencyRupeeOutlinedIcon },
  { name: "Offers", path: "/offers", icon: LocalOfferIcon },
  { name: "Customers", path: "/customers", icon: PersonOutlineIcon },
  { name: "Inventory", path: "/inventory", icon: Inventory2Icon },
  { name: "Reports", path: "/reports", icon: BarChartIcon },
];
