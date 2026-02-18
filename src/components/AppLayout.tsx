import { NavLink, Outlet } from "react-router-dom";
import { Map, BarChart3, TreePine, List } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", icon: Map, label: "Karta" },
  { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { to: "/bestands", icon: List, label: "Beståndslista" },
];

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-16 lg:w-56 flex-shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        <div className="flex items-center gap-2 px-3 py-4 border-b border-sidebar-border">
          <TreePine className="h-7 w-7 text-sidebar-primary flex-shrink-0" />
          <span className="hidden lg:block font-display text-lg font-bold tracking-tight">SkogsAdmin</span>
        </div>
        <nav className="flex-1 flex flex-col gap-1 p-2 mt-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="hidden lg:block">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
