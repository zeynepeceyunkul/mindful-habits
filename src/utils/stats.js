export function getLast7DaysStats(habits) {
  const today = new Date();
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const dateStr = d.toISOString().split("T")[0];

    let completedCount = 0;

    habits.forEach((habit) => {
      if (habit.completedDates.includes(dateStr)) {
        completedCount++;
      }
    });

    days.push({
      date: d.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
      }),
      completed: completedCount,
    });
  }

  return days;
}
