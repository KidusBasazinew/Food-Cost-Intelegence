import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { suppliersApi } from "@/features/inventory/api/suppliersApi";

export function useSuppliersQuery(options = {}) {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: suppliersApi.list,
    ...options,
  });
}

export function useCreateSupplierMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => suppliersApi.create(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}
