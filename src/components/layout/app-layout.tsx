"use client";

import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";
import { AppSidebar } from "./app-sidebar";
import { AppNavbar } from "./app-navbar";
import { motion } from "framer-motion";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebarStore();

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <motion.div
        initial={false}
        animate={{ marginLeft: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex min-h-screen flex-col"
      >
        <AppNavbar />
        <main className="flex-1">{children}</main>
      </motion.div>
    </div>
  );
}
