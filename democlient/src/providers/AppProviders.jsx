import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { AuthBootstrap } from "@/features/auth/components/AuthBootstrap";

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthBootstrap />
        {children}
        <ToastProvider />
      </QueryProvider>
    </ThemeProvider>
  );
}
