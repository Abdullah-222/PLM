import {
  LayoutDashboard,
  Package,
  Network,
  FileText,
  GitBranch,
  Workflow,
  ClipboardList,
  CheckSquare,
  Search,
  Shield,
  Bell,
  Settings,
  Box,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    title: "Product Data",
    items: [
      { label: "Products", href: "/products", icon: Package },
      { label: "CAD Management", href: "/cad", icon: Box },
      { label: "BOM", href: "/bom", icon: Network },
      { label: "Documents", href: "/documents", icon: FileText },
      { label: "Revisions", href: "/revisions", icon: GitBranch },
    ],
  },
  {
    title: "Process",
    items: [
      { label: "Workflows", href: "/workflows", icon: Workflow },
      { label: "Change Requests", href: "/changes", icon: ClipboardList, badge: 3 },
      { label: "Tasks", href: "/tasks", icon: CheckSquare, badge: 5 },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Search Center", href: "/search", icon: Search },
      { label: "Audit Logs", href: "/audit", icon: Shield },
      { label: "Notifications", href: "/notifications", icon: Bell, badge: 2 },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];
