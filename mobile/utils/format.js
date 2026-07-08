export function formatETB(cents) {
  return `${Math.round(cents / 100).toLocaleString("en-US")} ETB`;
}

export function minutesSince(isoString) {
  return Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
}

export function elapsedLabel(isoString) {
  const mins = minutesSince(isoString);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}
