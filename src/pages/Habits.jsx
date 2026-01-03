import { useState } from "react";
import { calculateStreak } from "../utils/streak";
import { getAchievement } from "../utils/achievements";
import { getProgressPercent } from "../utils/progress";
import { todayString } from "../utils/date";

export default function Habits({ habits, setHabits, toggleHabit, deleteHabit }) {
  const today = todayString();

  // 🔹 today numeric value helper
  const getTodayNumericValue = (habit) => {
    const entry = habit.completedDates.find(
      (c) => typeof c === "object" && c.date === today
    );
    return entry ? entry.value : 0;
  };

  // 🔹 today completed helper (boolean + numeric)
  const isCompletedToday = (habit) => {
    if (habit.type === "boolean") {
      return habit.completedDates.includes(today);
    }

    if (habit.type === "numeric") {
      const value = getTodayNumericValue(habit);
      return habit.target ? value >= habit.target : false;
    }

    return false;
  };

  /* ================== 🆕 LAST 7 DAYS HELPERS ================== */
  const getLast7Days = () =>
    [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });

  const last7Days = getLast7Days();

  const isCompletedOnDate = (habit, date) =>
    habit.completedDates.some((c) =>
      typeof c === "string" ? c === date : c.date === date
    );
  /* ============================================================ */
    

  /* -------- EDIT STATES -------- */
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState("boolean");
  const [editTarget, setEditTarget] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editIcon, setEditIcon] = useState("✨");

  /* -------- SAVE EDIT -------- */
  const saveEditHabit = () => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id !== editingId
          ? h
          : {
              ...h,
              title: editTitle,
              type: editType,
              icon: editIcon,
              target: editType === "numeric" ? Number(editTarget) : undefined,
              unit: editType === "numeric" ? editUnit : undefined,
            }
      )
    );

    setIsEditOpen(false);
    setEditingId(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-semibold text-slate-800">My Habits</h1>

      {/* EMPTY STATE */}
      {habits.length === 0 && (
        <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center">
          <p className="text-lg text-slate-600">No habits yet 🌱</p>
          <p className="text-sm text-slate-500 mt-1">
            Add your first habit from Dashboard
          </p>
        </div>
      )}

      {/* HABIT LIST */}
      <ul className="space-y-4">
        {habits.map((habit) => {
          const isPaused = habit.paused ?? false;
          const streak = calculateStreak(habit.completedDates);
          const achievement = getAchievement(streak);
          const progress =
            habit.type === "numeric"
              ? Math.min(
                  100,
                  Math.round(
                    (getTodayNumericValue(habit) / habit.target) * 100
                  )
                )
              : getProgressPercent(streak);

          const isDoneToday = isCompletedToday(habit);

          return (
            <li
              key={habit.id}
              className="bg-white border border-slate-200 rounded-2xl p-5"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-lg font-medium text-slate-800">
                    {habit.icon} {habit.title}
                    {habit.paused && (
  <span className="text-xs text-amber-500 ml-2">
    ⏸ Paused
  </span>
)}

                    {habit.type === "numeric" && (
                      <span className="text-xs text-slate-500 ml-2">
                        ({habit.target} {habit.unit})
                      </span>
                    )}
                  </p>

                  <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                    🔥 {streak} day streak
                    {achievement && (
                      <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-xs">
                        {achievement.emoji} {achievement.label}
                      </span>
                    )}
                  </p>

                  {habit.type === "numeric" && (
                    <p className="text-xs text-slate-500 mt-1">
                      Today: {getTodayNumericValue(habit)} / {habit.target}{" "}
                      {habit.unit}
                    </p>
                  )}
                </div>

                {/* ACTIONS */}
                <button
  onClick={() =>
    setHabits((prev) =>
      prev.map((h) =>
        h.id !== habit.id
          ? h
          : { ...h, paused: !h.paused }
      )
    )
  }
  className={`px-3 py-1 rounded-xl text-sm ${
    isPaused

      ? "bg-indigo-400 hover:bg-indigo-500 text-white"
      : "bg-slate-300 hover:bg-slate-400 text-slate-800"
  }`}
>
  {habit.paused ? "Resume" : "Pause"}
</button>

                <div className="flex gap-2">
                  <button
  onClick={() => {
    if (habit.paused) return;   // ✅ İŞTE TAM BURASI
    toggleHabit(habit.id);
  }}
  className={`px-3 py-1 rounded-xl text-sm ${
    isDoneToday
      ? "bg-slate-200 text-slate-500"
      : "bg-emerald-400 hover:bg-emerald-500 text-white"
  }`}
>
  {isDoneToday ? "Done" : "Check"}
</button>

                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="px-3 py-1 rounded-xl bg-rose-400 hover:bg-rose-500 text-white text-sm"
                  >
                    Delete
                  </button>

                  <button
                    onClick={() => {
                      setEditingId(habit.id);
                      setEditTitle(habit.title);
                      setEditType(habit.type);
                      setEditTarget(habit.target || "");
                      setEditUnit(habit.unit || "");
                      setEditIcon(habit.icon);
                      setIsEditOpen(true);
                    }}
                    className="px-3 py-1 rounded-xl bg-amber-300 hover:bg-amber-400 text-slate-800 text-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* NUMERIC QUICK INPUT */}
              {habit.type === "numeric" && !isDoneToday && (
                <div className="flex gap-2 mt-3">
                  <input
                    type="number"
                    placeholder={habit.unit}
                    className="w-24 p-1 border rounded-lg text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const value = Number(e.target.value);
                        if (!value) return;

                        setHabits((prev) =>
                          prev.map((h) =>
                            h.id !== habit.id
                              ? h
                              : {
                                  ...h,
                                  completedDates: [
                                    ...h.completedDates.filter(
                                      (c) =>
                                        typeof c === "string" ||
                                        c.date !== today
                                    ),
                                    { date: today, value },
                                  ],
                                }
                          )
                        );

                        e.target.value = "";
                      }
                    }}
                  />
                  <span className="text-xs text-slate-400 self-center">
                    press Enter
                  </span>
                </div>
              )}

              {/* PROGRESS */}
              <div className="mt-4">
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: "#6366f1",
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {habit.type === "numeric"
                    ? `Goal: ${habit.target} ${habit.unit} / day`
                    : `${streak} / 30 days`}
                </p>
              </div>

              {/* 🆕 LAST 7 DAYS MINI HISTORY */}
              <div className="flex gap-1 mt-3">
                {last7Days.map((day) => {
                  const done = isCompletedOnDate(habit, day);
                  return (
                    <div
                      key={day}
                      title={day}
                      className={`w-4 h-4 rounded-sm ${
                        done ? "bg-indigo-500" : "bg-slate-200"
                      }`}
                    />
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>

      {/* EDIT MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-96 space-y-4 border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">Edit Habit</h2>

            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
              placeholder="Habit title"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-3 py-1 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={saveEditHabit}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1 rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
