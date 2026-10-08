import { useQuery } from "@tanstack/react-query";

import { leakageApi } from "@/features/analytics/api/leakageApi";

export function useLeakageDashboardQuery(params, options = {}) {
  return useQuery({
    queryKey: ["analytics", "leakage", "dashboard", params ?? {}],
    queryFn: () => leakageApi.dashboard(params ?? {}),
    ...options,
  });
}
