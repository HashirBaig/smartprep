import {
  AlertTriangle,
  BarChart3,
  Boxes,
  LayoutDashboard,
  Settings,
  ShoppingCart,
} from "lucide-react";

export const APP_NAME = "SmartPrep";

export const RESTAURANT_NAME = "Riverside Grill";

export const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    enabled: true,
  },
  {
    label: "Inventory",
    path: "/inventory",
    icon: Boxes,
    enabled: true,
  },
  {
    label: "Forecasts",
    path: "/forecasts",
    icon: BarChart3,
    enabled: true,
  },
  {
    label: "Purchase Plan",
    path: "/purchase-plan",
    icon: ShoppingCart,
    enabled: true,
  },
  {
    label: "Waste Alerts",
    path: "/waste-alerts",
    icon: AlertTriangle,
    enabled: false,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
    enabled: false,
  },
] as const;

export const PURCHASE_SAFETY_BUFFER = 0.1;

export const EXPIRY_WARNING_DAYS = 7;
export const HIGH_RISK_EXPIRY_DAYS = 3;
