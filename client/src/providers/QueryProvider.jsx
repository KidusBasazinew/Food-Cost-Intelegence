import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

function getErrorMessage(err) {
  return err?.message || "Something went wrong";
}

export function QueryProvider({ children }) {
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (err) => {
            toast.error(getErrorMessage(err));
          },
        }),
        mutationCache: new MutationCache({
          onError: (err) => {
            toast.error(getErrorMessage(err));
          },
        }),
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 30_000,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
