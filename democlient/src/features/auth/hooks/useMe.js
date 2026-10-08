import { useQuery } from "@tanstack/react-query";

import { authApi } from "@/features/auth/api/authApi";

export function useMeQuery(options = {}) {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    ...options,
  });
}
