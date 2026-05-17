import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { measurementUnitsApi } from "@/features/inventory/api/measurementUnitsApi";

export function useMeasurementUnitsQuery(options = {}) {
  return useQuery({
    queryKey: ["measurementUnits"],
    queryFn: measurementUnitsApi.list,
    ...options,
  });
}

export function useCreateMeasurementUnitMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => measurementUnitsApi.create(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["measurementUnits"] });
    },
  });
}

export function useUpdateMeasurementUnitMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }) => measurementUnitsApi.update(id, input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["measurementUnits"] });
    },
  });
}

export function useDeleteMeasurementUnitMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => measurementUnitsApi.remove(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["measurementUnits"] });
    },
  });
}
