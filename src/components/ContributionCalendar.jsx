export default function ContributionCalendar({ habits }) {
  const days = [...Array(30)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });

  const isCompletedOnDate = (habit, date) =>
    habit.completedDates.some((c) =>
      typeof c === "string" ? c === date : c.date === date
    );

  const getCompletionCount = (date) =>
    habits.filter((h) => isCompletedOnDate(h, date)).length;

  const getColor = (count, maxCount) => {
    if (count === 0) return "bg-slate-200";
    const intensity = maxCount > 0 ? Math.min(count / maxCount, 1) : 0;
    if (intensity < 0.25) return "bg-emerald-300";
    if (intensity < 0.5) return "bg-emerald-400";
    if (intensity < 0.75) return "bg-emerald-500";
    return "bg-emerald-600";
  };

  const maxCount = Math.max(...days.map(getCompletionCount), 1);

  return (
    <div>
      <h2 className="font-semibold text-slate-800 mb-4 text-lg">Last 30 Days Activity</h2>

      <div className="grid grid-cols-10 gap-2 mb-4">
        {days.map((date) => {
          const count = getCompletionCount(date);

          return (
            <div
              key={date}
              title={`${new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} → ${count} habit${count !== 1 ? "s" : ""} completed`}
              className={`w-8 h-8 rounded transition-all hover:scale-110 cursor-pointer ${getColor(count, maxCount)}`}
            />
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-600">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded bg-slate-200"></div>
          <div className="w-3 h-3 rounded bg-emerald-300"></div>
          <div className="w-3 h-3 rounded bg-emerald-400"></div>
          <div className="w-3 h-3 rounded bg-emerald-500"></div>
          <div className="w-3 h-3 rounded bg-emerald-600"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
