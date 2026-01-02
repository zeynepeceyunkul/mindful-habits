import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-56 bg-gray-900 min-h-screen p-4 space-y-6">
      <h2 className="text-xl font-bold text-white">Habit Tracker</h2>

      <nav className="space-y-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `block px-3 py-2 rounded ${
              isActive ? "bg-blue-600" : "hover:bg-gray-800"
            }`
          }
        >
          🏠 Dashboard
        </NavLink>

        <NavLink
          to="/habits"
          className={({ isActive }) =>
            `block px-3 py-2 rounded ${
              isActive ? "bg-blue-600" : "hover:bg-gray-800"
            }`
          }
        >
          ✅ Habits
        </NavLink>

        <NavLink
          to="/progress"
          className={({ isActive }) =>
            `block px-3 py-2 rounded ${
              isActive ? "bg-blue-600" : "hover:bg-gray-800"
            }`
          }
        >
          📊 Progress
        </NavLink>
      </nav>
    </aside>
  );
}
