import { useQuery } from "@tanstack/react-query";
import { http } from "@/api/http";

export function useWorkforceAnalytics(params = {}, options = {}) {
  const queryKey = ["workforce", "analytics", params];
  return useQuery({
    queryKey,
    queryFn: () =>
      http.get("/analytics/attendance", { params }).then((r) => r.data.data),
    ...options,
  });
}
