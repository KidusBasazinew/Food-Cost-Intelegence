import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roomOpsApi } from "@/features/roomops/api/roomOpsApi";

export function useRoomsQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: ["roomops", "rooms", params],
    queryFn: () => roomOpsApi.listRooms(params),
    ...options,
  });
}

export function useReservationsQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: ["roomops", "reservations", params],
    queryFn: () => roomOpsApi.listReservations(params),
    ...options,
  });
}

export function useHousekeepingTasksQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: ["roomops", "housekeeping", params],
    queryFn: () => roomOpsApi.listHousekeepingTasks(params),
    ...options,
  });
}

export function useLateCheckoutsQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: ["roomops", "late-checkouts", params],
    queryFn: () => roomOpsApi.listLateCheckouts(params),
    ...options,
  });
}

export function useCreateHousekeepingMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => roomOpsApi.createHousekeepingTask(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["roomops", "housekeeping"] });
    },
  });
}

export function useCreateRoomMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => {
      return roomOpsApi.createRoom(input);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["roomops", "rooms"] });
    },
  });
}

export function useUpdateRoomMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }) => {
      return roomOpsApi.updateRoom(id, input);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["roomops", "rooms"] });
    },
  });
}

export function useDeleteRoomMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => {
      return roomOpsApi.deleteRoom(id);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["roomops", "rooms"] });
    },
  });
}

export function useStartHousekeepingMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId) => {
      return roomOpsApi.startHousekeepingTask(taskId);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["roomops", "housekeeping"] });
    },
  });
}

export function useCompleteHousekeepingMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId) => roomOpsApi.completeHousekeepingTask(taskId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["roomops", "housekeeping"] });
    },
  });
}

export function useVerifyHousekeepingMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId) => {
      return roomOpsApi.verifyHousekeepingTask(taskId);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["roomops", "housekeeping"] });
    },
  });
}

export function useDetectLateCheckoutsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => roomOpsApi.detectLateCheckouts(),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["roomops", "reservations"] });
    },
  });
}

export function useCreateReservationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => {
      return roomOpsApi.createReservation(input);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["roomops", "reservations"] });
    },
  });
}

export function useCheckInReservationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => {
      return roomOpsApi.checkInReservation(id);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["roomops", "reservations"] });
      await qc.invalidateQueries({ queryKey: ["roomops", "rooms"] });
    },
  });
}

export function useCheckOutReservationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => {
      return roomOpsApi.checkOutReservation(id);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["roomops", "reservations"] });
      await qc.invalidateQueries({ queryKey: ["roomops", "rooms"] });
      await qc.invalidateQueries({ queryKey: ["roomops", "housekeeping"] });
    },
  });
}
