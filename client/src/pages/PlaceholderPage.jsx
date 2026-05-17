export function PlaceholderPage({ title, subtitle }) {
  return (
    <div className="space-y-2">
      <div className="text-xl font-semibold tracking-tight">{title}</div>
      <div className="text-sm text-muted-foreground">
        {subtitle ||
          "Module foundation is prepared. Features will be built in later stages."}
      </div>
    </div>
  );
}
