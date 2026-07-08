// Last 7 days of reception-relevant metrics.
// dailyProfitCents: simplified room-revenue minus estimated operating cost, for dashboard trend purposes.
// reservationsCount: total reservations active that day (RESERVED + CHECKED_IN).

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const weeklyStats = [
  { day: DAY_LABELS[0], dailyProfitCents: 128000, reservationsCount: 6 },
  { day: DAY_LABELS[1], dailyProfitCents: 145000, reservationsCount: 8 },
  { day: DAY_LABELS[2], dailyProfitCents: 98000, reservationsCount: 5 },
  { day: DAY_LABELS[3], dailyProfitCents: 176000, reservationsCount: 9 },
  { day: DAY_LABELS[4], dailyProfitCents: 210000, reservationsCount: 11 },
  { day: DAY_LABELS[5], dailyProfitCents: 265000, reservationsCount: 13 },
  { day: DAY_LABELS[6], dailyProfitCents: 190000, reservationsCount: 10 },
];
