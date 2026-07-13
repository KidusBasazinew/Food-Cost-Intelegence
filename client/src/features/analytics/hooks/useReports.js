import { useQuery } from "@tanstack/react-query";

import { reportsApi } from "@/features/analytics/api/reportsApi";

export function useReportsListQuery(options = {}) {
  return useQuery({
    queryKey: ["analytics", "reports", "list"],
    queryFn: () => reportsApi.list(),
    ...options,
  });
}
