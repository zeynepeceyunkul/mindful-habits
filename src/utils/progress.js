export function getProgressPercent(streak, goal = 30) {
  const percent = Math.min((streak / goal) * 100, 100);
  return Math.round(percent);
}
