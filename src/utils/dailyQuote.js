import { quotes } from "./quotes";

export function getDailyQuote(date) {
  const index =
    date
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    quotes.length;

  return quotes[index];
}
