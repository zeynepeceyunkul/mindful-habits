export const badges = [
  {
    id: "first-check",
    label: "First Step",
    emoji: "👣",
    condition: (habits) =>
      habits.some((h) => h.completedDates.length >= 1),
  },
  {
    id: "streak-7",
    label: "7 Day Streak",
    emoji: "🔥",
    condition: (habits) =>
      habits.some((h) => h.completedDates.length >= 7),
  },
  {
    id: "streak-30",
    label: "30 Day Legend",
    emoji: "🏆",
    condition: (habits) =>
      habits.some((h) => h.completedDates.length >= 30),
  },
  {
    id: "multi-habit",
    label: "Multi Tasker",
    emoji: "⚡",
    condition: (habits) =>
      habits.filter((h) => h.completedDates.length > 0).length >= 3,
  },
];
