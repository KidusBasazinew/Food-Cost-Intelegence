import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { recipeIngredientsApi } from "@/features/recipes/api/recipeIngredientsApi";

export function useRecipeIngredientsQuery(recipeId, options = {}) {
  return useQuery({
    queryKey: ["recipes", recipeId, "ingredients"],
    queryFn: () => recipeIngredientsApi.list(recipeId),
    enabled: Boolean(recipeId),
    ...options,
  });
}

export function useAddRecipeIngredientMutation(recipeId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => recipeIngredientsApi.add(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["recipes"] });
      if (recipeId) {
        await qc.invalidateQueries({
          queryKey: ["recipes", "detail", recipeId],
        });
        await qc.invalidateQueries({
          queryKey: ["recipes", recipeId, "ingredients"],
        });
      }
    },
  });
}

export function useUpdateRecipeIngredientMutation(recipeId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }) => recipeIngredientsApi.update(id, input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["recipes"] });
      if (recipeId) {
        await qc.invalidateQueries({
          queryKey: ["recipes", "detail", recipeId],
        });
        await qc.invalidateQueries({
          queryKey: ["recipes", recipeId, "ingredients"],
        });
      }
    },
  });
}

export function useDeleteRecipeIngredientMutation(recipeId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => recipeIngredientsApi.remove(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["recipes"] });
      if (recipeId) {
        await qc.invalidateQueries({
          queryKey: ["recipes", "detail", recipeId],
        });
        await qc.invalidateQueries({
          queryKey: ["recipes", recipeId, "ingredients"],
        });
      }
    },
  });
}
