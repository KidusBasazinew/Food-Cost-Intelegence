import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DialogForm({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  loading = false,
  size = "default",
  className,
}) {
  const sizeClass = {
    default: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(sizeClass[size], "max-h-[90vh] p-0", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit?.(e);
          }}
        >
          <DialogBody>{children}</DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              disabled={loading}
              className="rounded-xl"
            >
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl">
              {loading ? "Saving…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * @param {"grid" | "stack"} layout - stack = single column (best for simple modals)
 */
export function FormSection({
  title,
  description,
  children,
  className,
  layout = "grid",
}) {
  return (
    <div className={cn("erp-dialog-section rounded-xl border p-4", className)}>
      {title ? (
        <div className="mb-4 border-b border-[var(--dialog-border)] pb-3">
          <h4 className="text-sm font-semibold text-[var(--dialog-fg)]">
            {title}
          </h4>
          {description ? (
            <p className="mt-1 text-xs text-[var(--dialog-muted)]">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
      <div
        className={cn(
          layout === "stack"
            ? "flex flex-col gap-4"
            : "grid grid-cols-1 gap-4 sm:grid-cols-2",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function FormField({ label, children, className, fullWidth, htmlFor }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5",
        fullWidth && "sm:col-span-2",
        className,
      )}
    >
      {label ? (
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-[var(--dialog-fg)]"
        >
          {label}
        </label>
      ) : null}
      <div className="w-full [&_input]:erp-dialog-input [&_input]:w-full [&_button[role=combobox]]:erp-dialog-input [&_button[role=combobox]]:w-full">
        {children}
      </div>
    </div>
  );
}

export function FormRow({ children, className }) {
  return (
    <div
      className={cn("grid w-full grid-cols-1 gap-4 sm:grid-cols-2", className)}
    >
      {children}
    </div>
  );
}
