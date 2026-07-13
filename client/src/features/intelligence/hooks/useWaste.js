import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { wasteApi } from "@/features/intelligence/api/wasteApi";

export function useWasteListQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: ["intelligence", "waste", "list", params],
    queryFn: () => wasteApi.list(params),
    ...options,
  });
}

export function useWasteReportQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: ["intelligence", "waste", "report", params],
    queryFn: () => wasteApi.report(params),
    ...options,
  });
}

export function useLogWasteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => wasteApi.log(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["intelligence", "waste"] });
      await qc.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}
