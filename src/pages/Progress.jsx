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

export default function Progress({ habits }) {
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const dailyCompletion = last7Days.map((date) => ({
    date: date.slice(5),
    completed: habits.filter((h) =>
      h.completedDates.includes(date)
    ).length,
  }));

  const habitStats = habits.map((h) => ({
    name: h.title,
    streak: calculateStreak(h.completedDates),
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-24">
      <h1 className="text-3xl font-semibold text-slate-800">
        Progress & Statistics
      </h1>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Best Streak",
            value: habits.length
              ? Math.max(...habits.map((h) =>
                  calculateStreak(h.completedDates)
                ))
              : 0,
            color: "text-emerald-500",
            emoji: "🔥",
          },
          {
            label: "Total Completions",
            value: habits.reduce(
              (sum, h) => sum + h.completedDates.length,
              0
            ),
            color: "text-indigo-500",
          },
          {
            label: "Completed Today",
            value: habits.filter((h) =>
              h.completedDates.includes(
                new Date().toISOString().split("T")[0]
              )
            ).length,
            color: "text-purple-500",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 p-4 rounded-2xl"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className={`text-2xl font-bold ${item.color}`}>
              {item.value} {item.emoji || ""}
            </p>
          </div>
        ))}
      </div>

      {/* CHARTS */}
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

      <div className="bg-white border border-slate-200 p-5 rounded-2xl">
        <h2 className="mb-3 font-medium text-slate-700">
          Habit Streaks
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={habitStats}>
            <XAxis dataKey="name" hide />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="streak"
              stroke="#34d399"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-slate-200 p-5 rounded-2xl">
        <ContributionCalendar habits={habits} />
      </div>

      <div className="bg-white border border-slate-200 p-5 rounded-2xl">
        <h2 className="mb-3 font-medium text-slate-700">
          Achievements
        </h2>
        <div className="flex flex-wrap gap-3">
          {badges.map(
            (badge) =>
              badge.condition(habits) && (
                <div
                  key={badge.id}
                  className="bg-indigo-50 text-indigo-600 px-3 py-2 rounded-full text-sm"
                >
                  {badge.emoji} {badge.label}
                </div>
              )
          )}
          {badges.every((b) => !b.condition(habits)) && (
            <p className="text-slate-500 text-sm">
              No achievements yet. Keep going 💪
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
