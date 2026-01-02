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
      <h1 className="text-3xl font-semibold text-slate-800">
        Progress & Statistics
      </h1>
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
          value={`${bestStreak} 🔥`}
          color="text-emerald-500"
        />
        <SummaryCard
          label="Total Completions"
          value={totalCompletions}
          color="text-indigo-500"
        />
        <SummaryCard
          label="Completed Today"
          value={completedToday}
          color="text-purple-500"
        />
      </div>

      {/* WEEKLY CHART */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl">
        <h2 className="mb-3 font-medium text-slate-700">
          Last 7 Days Completion
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
      <div className="bg-white border border-slate-200 p-5 rounded-2xl">
        <h2 className="mb-3 font-medium text-slate-700">
          Strongest Habits
        </h2>

        <ul className="space-y-2">
          {strongestHabits.map((h) => (
            <li
              key={h.id}
              className="flex justify-between items-center bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl"
            >
              <span>{h.icon} {h.title}</span>
              <span className="text-sm text-slate-500">
                🔥 {h.streak} days
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* WEAK DAY */}
      {weakestDay && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
          ⚠️ Weakest day: <strong>{weakestDay.date}</strong> (
          {weakestDay.completed})
        </div>
      )}

      {/* STREAK LINE */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl">
        <h2 className="mb-3 font-medium text-slate-700">
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
      <div className="bg-white border border-slate-200 p-5 rounded-2xl">
        <ContributionCalendar habits={habits} />
      </div>

      {/* ACHIEVEMENTS */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl">
        <h2 className="mb-3 font-medium text-slate-700">
          Achievements
        </h2>
        <div className="flex flex-wrap gap-3">
          {badges.map(
            (b) =>
              b.condition(habits) && (
                <div
                  key={b.id}
                  className="bg-indigo-50 text-indigo-600 px-3 py-2 rounded-full text-sm"
                >
                  {b.emoji} {b.label}
                </div>
              )
          )}
        </div>
      </div>

      {/* NUMERIC HABITS SUMMARY */}
      {numericHabits.length > 0 && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl">
          <h2 className="mb-3 font-medium text-slate-700">
            Numeric Habits Summary
          </h2>
          <ul className="space-y-2">
            {numericHabits.map((h) => (
              <li
                key={h.id}
                className="flex justify-between bg-slate-50 border px-3 py-2 rounded-xl"
              >
                <span>{h.icon} {h.title}</span>
                <span className="text-sm text-slate-500">
                  Total {h.total} {h.unit} | Avg {h.avg}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* NUMERIC HABITS – LAST 7 DAYS */}
      {numericHabits.length > 0 && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl">
          <h2 className="mb-3 font-medium text-slate-700">
            Numeric Habits – Last 7 Days
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
function SummaryCard({ label, value, color }) {
  return (
    <div className="bg-white border border-slate-200 p-4 rounded-2xl">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
