import { useQuery } from "@tanstack/react-query";

import { foodCostApi } from "@/features/intelligence/api/foodCostApi";

export function useFoodCostReportQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: ["intelligence", "foodCost", params],
    queryFn: () => foodCostApi.report(params),
    ...options,
  });
}
