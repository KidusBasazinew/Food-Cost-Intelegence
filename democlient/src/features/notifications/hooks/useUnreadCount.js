import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "../api/notificationsApi";

export function useUnreadCount({ refetchInterval = 10000 } = {}) {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationsApi.unreadCount(),
    refetchInterval,
    refetchOnWindowFocus: true,
    staleTime: 5000,
  });
}
