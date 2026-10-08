import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { notificationsApi } from "../api/notificationsApi";

export function useNotifications({ filters, refetchInterval = 15000 } = {}) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ["notifications", "list", filters ?? {}],
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      notificationsApi.list({
        cursor: pageParam ?? undefined,
        limit: 20,
        ...(filters ?? {}),
      }),
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    refetchInterval,
    refetchOnWindowFocus: true,
    staleTime: 5000,
  });

  const markRead = useMutation({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return {
    query,
    markRead,
    markAllRead,
  };
}
