// Business rule from spec: extra hours are charged proportionally,
// a full extra day is charged once the stay crosses 24h past checkout.
const HOURLY_RATE_CENTS = 80000; // 800 ETB/hour, matches original spec example
const FULL_DAY_RATE_CENTS = 450000; // fallback full-day charge, e.g. avg room rate

export function calculateLateCheckout(checkOutAt, actualOrNowIso) {
  const scheduled = new Date(checkOutAt);
  const actual = new Date(actualOrNowIso);
  const diffMs = actual - scheduled;

  if (diffMs <= 0) {
    return { isLate: false, hoursLate: 0, feeCents: 0, breakdown: null };
  }

  const hoursLate = diffMs / (1000 * 60 * 60);

  if (hoursLate >= 24) {
    const extraDays = Math.ceil(hoursLate / 24);
    return {
      isLate: true,
      hoursLate: Math.round(hoursLate * 10) / 10,
      feeCents: extraDays * FULL_DAY_RATE_CENTS,
      breakdown: `${extraDays} extra day${extraDays > 1 ? "s" : ""} charged`,
    };
  }

  const roundedHours = Math.ceil(hoursLate);
  return {
    isLate: true,
    hoursLate: Math.round(hoursLate * 10) / 10,
    feeCents: roundedHours * HOURLY_RATE_CENTS,
    breakdown: `${roundedHours}h past checkout`,
  };
}
