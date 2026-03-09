"use client";

import { useState } from "react";
import AppSideMenu from "./AppSideMenu";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return localStorage.getItem("appSideMenuCollapsed") === "true";
  });

  const toggleCollapse = () => {
    const newValue = !collapsed;
    setCollapsed(newValue);
    if (typeof window !== "undefined") {
      localStorage.setItem("appSideMenuCollapsed", String(newValue));
    }
  };

  return (
    <div className="flex">
      <AppSideMenu collapsed={collapsed} onToggle={toggleCollapse} />
      <main className={`flex-1 transition-all duration-300 ${collapsed ? "ml-16" : "ml-56"}`}>
        {children}
      </main>
    </div>
  );
}
