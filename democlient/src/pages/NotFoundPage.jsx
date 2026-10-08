import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex max-w-[900px] flex-col gap-3 px-6 py-24">
        <div className="text-sm text-muted-foreground">404</div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="text-sm text-muted-foreground">
          The route you requested doesn’t exist in this foundation build.
        </p>
        <div>
          <Link
            className="inline-flex rounded-lg border bg-card px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            to="/dashboard"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
