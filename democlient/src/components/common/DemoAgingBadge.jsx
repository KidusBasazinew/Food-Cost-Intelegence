/**
 * Small status badge for the FRONTEND-ONLY demo sales aging (democlient).
 * Shows how many sold items are still displaying real figures (fresh, < 1h),
 * and of the aged ones how many are randomly displayed (count-based sampling
 * with REAL prices — demo count ratio, default 1 in 10).
 */
export function DemoAgingBadge({
  freshCount = 0,
  agedCount = 0,
  sampledCount = null,
  className = "",
}) {
  const shown =
    sampledCount != null
      ? sampledCount
      : Math.max(agedCount > 0 ? 1 : 0, Math.ceil(agedCount * 0.1));
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300 ${className}`}
      title="Demo sales aging: each sold item shows real (unchanged) figures for 1 hour; after that, only a random fraction of aged items is displayed — with 100% real prices, quantities and recipes — to reduce visible sales volume without distorting meal economics."
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Demo aging: {freshCount} real · {shown}/{agedCount} aged shown
    </span>
  );
}
