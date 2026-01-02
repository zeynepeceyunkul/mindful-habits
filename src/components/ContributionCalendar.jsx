export default function ContributionCalendar({ habits }) {
  const days = [...Array(30)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });

  const getCompletionCount = (date) =>
    habits.filter((h) => h.completedDates.includes(date)).length;

  const getColor = (count) => {
    if (count === 0) return "bg-gray-800";
    if (count === 1) return "bg-green-700";
    if (count === 2) return "bg-green-600";
    return "bg-green-500";
  };

  return (
    <div>
      <h2 className="font-semibold mb-3">Last 30 Days</h2>

      <div className="grid grid-cols-10 gap-2">
        {days.map((date) => {
          const count = getCompletionCount(date);

          return (
            <div
              key={date}
              title={`${date} → ${count} habits`}
              className={`w-6 h-6 rounded ${getColor(count)}`}
            />
          );
        })}
      </div>
    </div>
  );
}
