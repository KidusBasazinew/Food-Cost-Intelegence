import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workforceApi } from "@/features/workforce/api/workforceApi";

export function useEmployeesQuery(options = {}) {
  return useQuery({
    queryKey: ["workforce", "employees"],
    queryFn: () => workforceApi.listEmployees(),
    ...options,
  });
}

export function usePinMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => workforceApi.pin(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["workforce", "employees"] });
    },
  });
}

export function useCreateEmployeeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => workforceApi.createEmployee(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["workforce", "employees"] });
    },
  });
}

export function useResetPinMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newPin }) => workforceApi.resetPin(id, newPin),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["workforce", "employees"] });
    },
  });
}

export function useUpdateEmployeeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }) => workforceApi.updateEmployee(id, input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["workforce", "employees"] });
    },
  });
}
