import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { inventoryApi } from "@/features/inventory/api/inventoryApi";

export function useInventoryItemsQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: ["inventory", "items", params],
    queryFn: () => inventoryApi.listItems(params),
    ...options,
  });
}

export function useInventoryItemQuery(id, options = {}) {
  return useQuery({
    queryKey: ["inventory", "item", id],
    queryFn: () => inventoryApi.getItem(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useCreateInventoryItemMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => inventoryApi.createItem(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["inventory", "items"] });
    },
  });
}

export function useCreateInventoryTransactionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => inventoryApi.createTransaction(input),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: ["inventory", "transactions"] });
      if (vars?.inventoryItemId) {
        await qc.invalidateQueries({
          queryKey: [
            "inventory",
            "transactions",
            { inventoryItemId: vars.inventoryItemId },
          ],
        });
        await qc.invalidateQueries({
          queryKey: ["inventory", "item", vars.inventoryItemId],
        });
        await qc.invalidateQueries({ queryKey: ["inventory", "items"] });
      }
    },
  });
}

export function useInventoryTransactionsQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: ["inventory", "transactions", params],
    queryFn: () => inventoryApi.listTransactions(params),
    ...options,
  });
}
