import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import { calculateStreak } from "../utils/streak";
import ContributionCalendar from "../components/ContributionCalendar";
import { badges } from "../utils/badges";

/* ---------------- HELPERS ---------------- */
const isCompletedOnDate = (habit, date) =>
  habit.completedDates.some((c) =>
    typeof c === "string" ? c === date : c.date === date
  );

export default function Progress({ habits }) {
  const [range, setRange] = useState("7");

  /* -------- LAST 7 DAYS -------- */
  const daysCount = range === "30" ? 30 : 7;

const days = [...Array(daysCount)].map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (daysCount - 1 - i));
  return d.toISOString().split("T")[0];
});


  const dailyCompletion = days.map((date) => ({
    date: date.slice(5),
    completed: habits.filter((h) =>
      isCompletedOnDate(h, date)
    ).length,
  }));

  /* -------- HABIT STATS -------- */
  const habitStats = habits.map((h) => ({
    id: h.id,
    title: h.title,
    icon: h.icon,
    streak: calculateStreak(h.completedDates),
  }));

  /* -------- NUMERIC HABITS STATS -------- */
  const numericHabits = habits
    .filter((h) => h.type === "numeric")
    .map((h) => {
      const values = h.completedDates
        .filter((c) => typeof c === "object")
        .map((c) => c.value);

      const total = values.reduce((sum, v) => sum + v, 0);
      const avg = values.length ? (total / values.length).toFixed(1) : 0;

      return {
        id: h.id,
        title: h.title,
        icon: h.icon,
        unit: h.unit,
        total,
        avg,
      };
    });

  /* -------- NUMERIC HABITS – LAST 7 DAYS DATA (FIXED) -------- */
  const numericWeeklyData = days.map((date) => {
    const total = habits
      .filter((h) => h.type === "numeric")
      .reduce((sum, h) => {
        const entry = h.completedDates.find(
          (c) => typeof c === "object" && c.date === date
        );
        return sum + (entry ? entry.value : 0);
      }, 0);

    return {
      date: date.slice(5),
      total,
    };
  });

  const strongestHabits = [...habitStats]
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 5);

  /* -------- SUMMARY -------- */
  const bestStreak = habits.length
    ? Math.max(
        ...habits.map((h) =>
          calculateStreak(h.completedDates)
        )
      )
    : 0;

  const totalCompletions = habits.reduce(
    (sum, h) => sum + h.completedDates.length,
    0
  );

  const today = new Date().toISOString().split("T")[0];

  const completedToday = habits.filter((h) =>
    isCompletedOnDate(h, today)
  ).length;

  /* -------- WEAK DAY -------- */
  const weakestDay =
    dailyCompletion.length > 0
      ? dailyCompletion.reduce((min, d) =>
          d.completed < min.completed ? d : min
        )
      : null;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-24">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Progress & Statistics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track your habits and see your progress over time
        </p>
      </div>
      <div className="flex gap-2 mt-4">
  <button
    onClick={() => setRange("7")}
    className={`px-4 py-1 rounded-xl text-sm ${
      range === "7"
        ? "bg-indigo-500 text-white"
        : "bg-slate-100 text-slate-600"
    }`}
  >
    Last 7 Days
  </button>

  <button
    onClick={() => setRange("30")}
    className={`px-4 py-1 rounded-xl text-sm ${
      range === "30"
        ? "bg-indigo-500 text-white"
        : "bg-slate-100 text-slate-600"
    }`}
  >
    Last 30 Days
  </button>
</div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          label="Best Streak"
          value={bestStreak}
          icon="🔥"
          gradient="from-orange-50 to-red-50"
          borderColor="border-orange-200"
          textColor="text-orange-600"
        />
        <SummaryCard
          label="Total Completions"
          value={totalCompletions}
          icon="✅"
          gradient="from-indigo-50 to-blue-50"
          borderColor="border-indigo-200"
          textColor="text-indigo-600"
        />
        <SummaryCard
          label="Completed Today"
          value={completedToday}
          icon="📊"
          gradient="from-purple-50 to-pink-50"
          borderColor="border-purple-200"
          textColor="text-purple-600"
        />
      </div>

      {/* WEEKLY CHART */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-800 text-lg">
          {range === "7" ? "Last 7 Days" : "Last 30 Days"} Completion
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={dailyCompletion}>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="completed" fill="#a5b4fc" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* STRONGEST HABITS */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-800 text-lg">
          Strongest Habits
        </h2>

        <ul className="space-y-2">
          {strongestHabits.map((h) => (
            <li
              key={h.id}
              className="flex justify-between items-center bg-gradient-to-r from-slate-50 to-indigo-50 border border-slate-200 px-4 py-3 rounded-xl hover:shadow-md transition-shadow"
            >
              <span className="font-medium text-slate-700">{h.icon} {h.title}</span>
              <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                🔥 {h.streak} days
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* WEAK DAY */}
      {weakestDay && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-2xl">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">⚠️ Weakest day:</span> <strong>{weakestDay.date}</strong> ({weakestDay.completed} habits completed)
          </p>
        </div>
      )}

      {/* STREAK LINE */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-800 text-lg">
          Habit Streaks
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={habitStats}>
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="streak"
              stroke="#34d399"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* CONTRIBUTION */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <ContributionCalendar habits={habits} />
      </div>

      {/* ACHIEVEMENTS */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-800 text-lg">
          Achievements
        </h2>
        <div className="flex flex-wrap gap-3">
          {badges.map(
            (b) =>
              b.condition(habits) && (
                <div
                  key={b.id}
                  className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                >
                  {b.emoji} {b.label}
                </div>
              )
          )}
          {badges.filter((b) => b.condition(habits)).length === 0 && (
            <p className="text-sm text-slate-500">No achievements yet. Keep building your habits!</p>
          )}
        </div>
      </div>

      {/* NUMERIC HABITS SUMMARY */}
      {numericHabits.length > 0 && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-800 text-lg">
            Numeric Habits Summary
          </h2>
          <ul className="space-y-2">
            {numericHabits.map((h) => (
              <li
                key={h.id}
                className="flex justify-between bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 px-4 py-3 rounded-xl hover:shadow-md transition-shadow"
              >
                <span className="font-medium text-slate-700">{h.icon} {h.title}</span>
                <span className="text-sm font-semibold text-blue-600">
                  Total {h.total} {h.unit} | Avg {h.avg} {h.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* NUMERIC HABITS – LAST 7 DAYS */}
      {numericHabits.length > 0 && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-800 text-lg">
            Numeric Habits – {range === "7" ? "Last 7 Days" : "Last 30 Days"}
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={numericWeeklyData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#c7d2fe" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* ---------------- SMALL COMPONENT ---------------- */
function SummaryCard({ label, value, icon, gradient, borderColor, textColor }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} border ${borderColor} p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
}
