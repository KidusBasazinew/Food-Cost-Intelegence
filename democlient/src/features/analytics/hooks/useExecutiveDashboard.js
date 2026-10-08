import { useQuery } from "@tanstack/react-query";

import { analyticsApi } from "@/features/analytics/api/analyticsApi";

export function useExecutiveDashboardQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: ["analytics", "executive", params],
    queryFn: () => analyticsApi.executive(params),
    ...options,
  });
}
