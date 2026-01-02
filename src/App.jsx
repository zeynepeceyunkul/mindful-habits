import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Habits from "./pages/Habits";
import Progress from "./pages/Progress";

const STORAGE_KEY = "habits";

export default function App() {
  const [habits, setHabits] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  const toggleHabit = (id) => {
    const today = new Date().toISOString().split("T")[0];

    setHabits((prev) =>
      prev.map((h) =>
        h.id !== id
          ? h
          : {
              ...h,
              completedDates: h.completedDates.includes(today)
                ? h.completedDates.filter((d) => d !== today)
                : [...h.completedDates, today],
            }
      )
    );
  };

  const deleteHabit = (id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* LAYOUT */}
        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={
              <Dashboard habits={habits} setHabits={setHabits} />
            }
          />

          <Route
            path="/habits"
            element={
              <Habits
                habits={habits}
                toggleHabit={toggleHabit}
                deleteHabit={deleteHabit}
              />
            }
          />

          <Route
            path="/progress"
            element={<Progress habits={habits} />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
