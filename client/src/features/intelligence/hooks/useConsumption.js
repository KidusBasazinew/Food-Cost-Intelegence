import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { consumptionApi } from "@/features/intelligence/api/consumptionApi";

export function useConsumptionsQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: ["intelligence", "consumption", "list", params],
    queryFn: () => consumptionApi.list(params),
    ...options,
  });
}

export function useConsumptionReportQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: ["intelligence", "consumption", "report", params],
    queryFn: () => consumptionApi.report(params),
    ...options,
  });
}

export function useUsageVelocityQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: ["intelligence", "consumption", "velocity", params],
    queryFn: () => consumptionApi.velocity(params),
    ...options,
  });
}

export function useConsumeRecipeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => consumptionApi.consumeRecipe(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["intelligence", "consumption"] });
      await qc.invalidateQueries({ queryKey: ["inventory"] });
      await qc.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}
