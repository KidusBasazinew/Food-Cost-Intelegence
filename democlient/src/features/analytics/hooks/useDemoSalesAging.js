import { useEffect, useState } from "react";

import { posService } from "@/services/pos.service";
import {
  computeDemoAgingFactorFromOrders,
  countFreshAndAged,
} from "@/features/analytics/utils/demoSalesAging";

/**
 * FRONTEND-ONLY demo hook (democlient).
 *
 * Fetches the most recent POS orders once (module-level cache shared across
 * pages) and re-polls every 60s, plus re-renders every 30s so items that cross
 * their 1-hour aging boundary flip into the "10% loop" live.
 *
 * Returns a money-scaling factor: sold items younger than 1h count at 100%,
 * older ones at 10%, normalized against the real total. When data is
 * unavailable the factor is 1 (real figures).
 */

const RECENT_ORDER_LIMIT = 100;
const POLL_MS = 60_000;
const TICK_MS = 30_000;

let cache = {
  orders: null,
  promise: null,
  lastFetchedAt: 0,
};

async function loadRecentOrders() {
  const rows = await posService.listOrders({
    page: 1,
    limit: RECENT_ORDER_LIMIT,
  });
  cache.orders = rows?.rows ?? [];
  cache.lastFetchedAt = Date.now();
  return cache.orders;
}

function ensureOrders(force = false) {
  const isStale = Date.now() - cache.lastFetchedAt > POLL_MS;
  if (force || cache.orders === null || (isStale && !cache.promise)) {
    cache.promise = loadRecentOrders()
      .catch(() => {
        // Demo-only feature: on failure keep whatever we have and stay quiet.
        cache.lastFetchedAt = Date.now();
      })
      .finally(() => {
        cache.promise = null;
      });
  }
  return cache.promise || Promise.resolve(cache.orders);
}

export function useDemoSalesAging() {
  const [tick, setTick] = useState(0);
  const [orders, setOrders] = useState(cache.orders);
  const [ready, setReady] = useState(cache.orders !== null);

  useEffect(() => {
    let cancelled = false;

    ensureOrders().finally(() => {
      if (!cancelled) {
        setOrders(cache.orders);
        setReady(true);
      }
    });

    const poll = setInterval(() => {
      ensureOrders(true).finally(() => {
        if (!cancelled) setOrders(cache.orders);
      });
    }, POLL_MS);

    // Re-render tick so < 1h / >= 1h boundaries flip live.
    const ticker = setInterval(() => setTick((t) => t + 1), TICK_MS);

    return () => {
      cancelled = true;
      clearInterval(poll);
      clearInterval(ticker);
    };
  }, []);

  // `tick` is intentionally unused directly — it just forces recomputation
  // so the per-item 1h timers are re-evaluated.
  const aging = computeDemoAgingFactorFromOrders(orders, Date.now());
  const counts = countFreshAndAged(orders, Date.now());
  void tick;

  return {
    ready,
    active: ready && aging.totalCents > 0,
    factor: aging.factor,
    freshCents: aging.freshCents,
    agedCents: aging.agedCents,
    totalCents: aging.totalCents,
    freshCount: counts.freshCount,
    agedCount: counts.agedCount,
    orders,
  };
}
