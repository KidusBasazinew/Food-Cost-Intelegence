import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { recipesApi } from "@/features/recipes/api/recipesApi";

export function useRecipesQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: ["recipes", params],
    queryFn: () => recipesApi.list(params),
    ...options,
  });
}

export function useRecipeQuery(id, options = {}) {
  return useQuery({
    queryKey: ["recipes", "detail", id],
    queryFn: () => recipesApi.get(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useCreateRecipeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => recipesApi.create(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}

export function useUpdateRecipeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }) => recipesApi.update(id, input),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: ["recipes"] });
      if (vars?.id) {
        await qc.invalidateQueries({
          queryKey: ["recipes", "detail", vars.id],
        });
      }
    },
  });
}

export function useDeleteRecipeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => recipesApi.remove(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}

export function useRecalculateRecipeCostMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => recipesApi.recalculateCost(id),
    onSuccess: async (_data, id) => {
      await qc.invalidateQueries({ queryKey: ["recipes"] });
      await qc.invalidateQueries({ queryKey: ["recipes", "detail", id] });
    },
  });
}
