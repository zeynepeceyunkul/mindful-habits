export function getAchievement(streak) {
  if (streak >= 30) {
    return { label: "Gold", emoji: "🥇", hint: "30+ day streak" };
  }
  if (streak >= 14) {
    return { label: "Silver", emoji: "🥈", hint: "14+ day streak" };
  }
  if (streak >= 7) {
    return { label: "Bronze", emoji: "🥉", hint: "7+ day streak" };
  }
  return null;
}
