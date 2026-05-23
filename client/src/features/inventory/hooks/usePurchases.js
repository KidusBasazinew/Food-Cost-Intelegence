import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { purchasesApi } from "@/features/inventory/api/purchasesApi";

export function usePurchasesQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: ["purchases", params.from, params.to, params.status],
    queryFn: () => purchasesApi.list(params),
    ...options,
  });
}

export function useCreatePurchaseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => purchasesApi.create(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["purchases"] });
      await qc.invalidateQueries({ queryKey: ["inventory", "items"] });
      await qc.invalidateQueries({ queryKey: ["inventory", "transactions"] });
    },
  });
}

export function useUpdatePurchaseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }) => purchasesApi.update(id, input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["purchases"] });
      await qc.invalidateQueries({ queryKey: ["inventory", "items"] });
      await qc.invalidateQueries({ queryKey: ["inventory", "transactions"] });
    },
  });
}
