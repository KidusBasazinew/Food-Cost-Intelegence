/**
 * Demo sales aging — FRONTEND ONLY (democlient).
 *
 * Rule (per product decision):
 *  - Every SOLD item (POS order) has its own 1-hour timer that starts at the
 *    order's completion/creation time on the backend. Nothing is stored
 *    client-side, so the timer survives refreshes and is per-item.
 *  - While an item is "fresh" (< 1h old) its real figures are displayed.
 *  - Once items age past 1h, we REDUCE THE NUMBER OF SOLD ITEMS DISPLAYED —
 *    never the money values. Out of every 1/DEMO_AGED_COUNT_RATIO aged items,
 *    only ceil(ratio × N) RANDOM ones are displayed, each with its REAL prices,
 *    REAL items and REAL totals, preferring different recipes across the picks.
 *    Example with the default 0.1: at 10 aged sold items → 1 random item shown;
 *    at 20 → 2 random items from different recipes. So revenue/totals drop to
 *    ~10% naturally, while every displayed meal keeps a realistic price,
 *    margin and ingredient cost.
 *  - Item prices, inventory, purchases, recipes and waste figures are NEVER
 *    modified.
 *
 * Configurable: DEMO_AGED_COUNT_RATIO (default 0.1) can be overridden at
 * runtime via localStorage key "demo.agingCountRatio" (e.g. 0.2 or 0.3),
 * without touching code.
 */

export const DEMO_AGING_WINDOW_MS = 60 * 1000 * 3; // 1 hour per sold item

/** Default: show 1 in every 10 aged sold items (configurable, see below). */
export const DEMO_AGED_COUNT_RATIO_DEFAULT = 0.1;

const RATIO_STORAGE_KEY = "demo.agingCountRatio";

const SOLD_STATUSES = new Set(["COMPLETED", "SERVED"]);

/** Returns the currently configured display ratio (default 0.1 = 1 in 10). */
export function getDemoAgingCountRatio() {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(RATIO_STORAGE_KEY);
      if (raw != null) {
        const n = Number(raw);
        if (Number.isFinite(n) && n > 0 && n <= 1) return n;
      }
    }
  } catch {
    // localStorage unavailable — fall through to default.
  }
  return DEMO_AGED_COUNT_RATIO_DEFAULT;
}

/** Changes the display ratio at runtime (persists in localStorage). */
export function setDemoAgingCountRatio(ratio) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(RATIO_STORAGE_KEY, String(ratio));
    }
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Deterministic PRNG (mulberry32, seeded from a string)
// ---------------------------------------------------------------------------
function hashSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function next() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function toNumber(value) {
  if (value == null) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function isSoldOrder(row) {
  return SOLD_STATUSES.has(String(row?.status || "").toUpperCase());
}

export function getSoldAtMs(row) {
  const raw = row?.completedAt ?? row?.createdAt;
  const ms = raw ? new Date(raw).getTime() : NaN;
  return Number.isFinite(ms) ? ms : null;
}

export function isFreshSoldRow(row, now = Date.now()) {
  if (!isSoldOrder(row)) return true; // non-sale rows are never aged
  const soldAt = getSoldAtMs(row);
  if (soldAt == null) return true;
  return now - soldAt < DEMO_AGING_WINDOW_MS;
}

function orderRecipeKeys(order) {
  const keys = new Set();
  for (const item of Array.isArray(order?.items) ? order.items : []) {
    if (item?.recipe?.name) keys.add(String(item.recipe.name));
  }
  return keys.size ? [...keys] : ["__unknown__"];
}

/**
 * Picks `count` orders from the aged pool, deterministically shuffled, keeping
 * real values untouched. Prefers orders with DIFFERENT recipes: first pass
 * skips repeats, second pass fills any remaining slots.
 */
export function sampleAgedOrders(agedOrders, count, seedKey) {
  const rand = mulberry32(hashSeed(seedKey));
  const pool = [...agedOrders];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const target = Math.max(0, Math.min(count, pool.length));
  const seenRecipes = new Set();
  const picked = [];
  const leftovers = [];

  for (const order of pool) {
    if (picked.length >= target) break;
    const keys = orderRecipeKeys(order);
    if (keys.some((k) => seenRecipes.has(k))) {
      leftovers.push(order);
      continue;
    }
    keys.forEach((k) => seenRecipes.add(k));
    picked.push(order);
  }

  for (const order of leftovers) {
    if (picked.length >= target) break;
    picked.push(order);
  }

  return picked;
}

/**
 * Row-level transform for POS order history.
 * Fresh sold orders → untouched (real values). Aged sold orders → only
 * ceil(ratio × agedCount) RANDOM orders are kept for display (real values,
 * different recipes preferred); the rest are dropped from the display list.
 * Non-sale rows (DRAFT, PREPARING, CANCELLED…) are untouched.
 */
export function applyDemoAgingToOrderRows(rows, now = Date.now()) {
  const list = Array.isArray(rows) ? rows : [];
  const ratio = getDemoAgingCountRatio();

  const agedPool = [];
  let freshCount = 0;
  let freshRevenueCents = 0;
  let agedRealRevenueCents = 0;

  for (const row of list) {
    if (!isSoldOrder(row)) {
      continue;
    }
    if (isFreshSoldRow(row, now)) {
      freshCount += 1;
      freshRevenueCents += toNumber(row.totalCents);
      continue;
    }
    agedPool.push(row);
    agedRealRevenueCents += toNumber(row.totalCents);
  }

  const agedCount = agedPool.length;
  const sampleCount = Math.max(
    agedCount > 0 ? 1 : 0,
    Math.ceil(agedCount * ratio),
  );
  // Seed with a day bucket (not the raw ms timestamp) so the random sample is
  // stable across refreshes within the same day, while still looking random.
  const dayBucket = Math.floor(now / (24 * 60 * 60 * 1000));
  const sampled = sampleAgedOrders(
    agedPool,
    sampleCount,
    `${dayBucket}:${agedPool.map((o) => o.id).join(",")}`,
  );

  const sampledIds = new Set(sampled.map((o) => o.id));
  let sampledRevenueCents = 0;
  for (const order of sampled) {
    sampledRevenueCents += toNumber(order.totalCents);
  }

  // Rebuild the display list PRESERVING the original row order: non-sale rows
  // and fresh sold rows as-is, aged rows only if they were sampled.
  const displayRows = [];
  for (const row of list) {
    if (!isSoldOrder(row)) {
      displayRows.push(row);
      continue;
    }
    if (isFreshSoldRow(row, now)) {
      displayRows.push(row);
    } else if (sampledIds.has(row.id)) {
      displayRows.push({ ...row, _demoAging: "sampled" });
    }
  }

  return {
    rows: displayRows,
    freshCount,
    agedCount,
    sampledCount: sampled.length,
    hiddenCount: agedCount - sampled.length,
    freshRevenueCents,
    agedRealRevenueCents,
    sampledRevenueCents,
    realRevenueCents: freshRevenueCents + agedRealRevenueCents,
    displayRevenueCents: freshRevenueCents + sampledRevenueCents,
  };
}

/**
 * Counts fresh (< 1h) vs aged (>= 1h) sold orders in a row list.
 * Non-sale rows are ignored.
 */
export function countFreshAndAged(rows, now = Date.now()) {
  const list = Array.isArray(rows) ? rows : [];
  let freshCount = 0;
  let agedCount = 0;
  for (const row of list) {
    if (!isSoldOrder(row)) continue;
    if (isFreshSoldRow(row, now)) freshCount += 1;
    else agedCount += 1;
  }
  return { freshCount, agedCount };
}

/**
 * Money scaling factor for aggregate KPIs (e.g. dashboards), derived from the
 * fetched order rows: displayed = fresh × 1 + aged × ratio (count-based, real
 * prices). Returns 1 when there is no sale data (so aggregates stay real).
 */
export function computeDemoAgingFactorFromOrders(rows, now = Date.now()) {
  const list = Array.isArray(rows) ? rows : [];
  const ratio = getDemoAgingCountRatio();
  let fresh = 0;
  let aged = 0;

  for (const row of list) {
    if (!isSoldOrder(row)) continue;
    if (isFreshSoldRow(row, now)) {
      fresh += toNumber(row.totalCents);
    } else {
      aged += toNumber(row.totalCents);
    }
  }

  const total = fresh + aged;
  if (total <= 0)
    return { factor: 1, freshCents: 0, agedCents: 0, totalCents: 0 };

  const displayTotal = fresh + aged * ratio;
  return {
    factor: displayTotal / total,
    freshCents: fresh,
    agedCents: aged,
    totalCents: total,
  };
}

/**
 * Stable per-row decision for whether an aged row is among the displayed
 * subset: selects 1 in every 1/ratio aged rows deterministically (same row
 * always gets the same answer, stable across refreshes and re-renders).
 */
export function shouldDisplayAgedRow(rowId, now = Date.now()) {
  const ratio = getDemoAgingCountRatio();
  const dayBucket = Math.floor(now / (24 * 60 * 60 * 1000));
  const rand = mulberry32(hashSeed(`${dayBucket}:${String(rowId)}`));
  return rand() < ratio;
}

/** Scale a cents value by the aging factor (used for aggregate KPIs). */
export function scaleMoneyByAgingFactor(cents, factor) {
  return toNumber(cents) * factor;
}

/** Scale a count of sold items (rounds; never below 0). */
export function scaleCountByAgingFactor(count, factor) {
  return Math.max(0, Math.round(toNumber(count) * factor));
}
