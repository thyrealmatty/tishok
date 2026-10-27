// Picks a greeting from the device's local time.
// No names are assumed. Names will come from the user's profile in Phase 3.
export function greetingFor(date: Date = new Date()): { title: string; subline: string } {
  const h = date.getHours();
  if (h < 5) return { title: "Still up?", subline: "A quiet moment to rest in God's peace." };
  if (h < 12) return { title: "Good morning.", subline: "Make room for God in your day." };
  if (h < 17) return { title: "Good afternoon.", subline: "A little growth, a little grace, a little more love." };
  if (h < 21) return { title: "Good evening.", subline: "Today is another chance to choose each other well." };
  return { title: "Good night.", subline: "Set the day down. Rest well." };
}
