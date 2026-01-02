import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">

      {/* SIDEBAR */}
      <aside
        className={`bg-white border-r border-slate-200 transition-all duration-300
        ${collapsed ? "w-20" : "w-64"} px-4 py-6`}
      >
        {/* LOGO / TITLE */}
        <div className="flex items-center justify-between mb-8">
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Mindful Habits
              </h2>
              <p className="text-xs text-slate-400">
                build consistency
              </p>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-slate-600 text-sm"
          >
            {collapsed ? "➡️" : "⬅️"}
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-1">
          {[
            { to: "/", label: "Today", icon: "☀️" },
            { to: "/habits", label: "Habits", icon: "✅" },
            { to: "/progress", label: "Progress", icon: "📈" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition
                ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-10 py-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
