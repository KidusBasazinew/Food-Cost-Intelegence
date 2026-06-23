import { useEffect, useState } from "react";
import { usePinMutation } from "@/features/workforce/hooks/useWorkforce";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { PageShell, PageHeader } from "@/components/ui/erp";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle } from "lucide-react";

const keypad = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  ["del", 0, "ok"],
];
function PadButton({ value, onClick, disabled }) {
  const label = value === "del" ? "⌫" : value === "ok" ? "OK" : String(value);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(value)}
      className="m-1 h-20 w-20 rounded-xl border bg-card text-2xl font-semibold shadow-sm transition hover:bg-muted disabled:opacity-50 md:h-24 md:w-24"
    >
      {label}
    </button>
  );
}

function formatTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatWorked(minutes) {
  const h = Math.floor((minutes ?? 0) / 60);
  const m = (minutes ?? 0) % 60;
  return `${h}h ${m}m`;
}

export default function AttendanceTerminal() {
  const user = useAuthStore((s) => s.user);
  const hotelId = user?.hotel?.id;
  const branchId = user?.branch?.id;

  const [pin, setPin] = useState("");
  const [overlay, setOverlay] = useState(null);

  const pinMutation = usePinMutation();

  useEffect(() => {
    if (!pinMutation.isSuccess) return;
    const d = pinMutation.data;
    const emp = d?.data?.employee;
    const isCheckout = d?.message === "Checked Out";
    console.log("PIN RESPONSE", pinMutation.data);
    setOverlay({
      isCheckout,
      name: emp ? `${emp.firstName} ${emp.lastName}` : "",
      role: emp?.role,
      time: isCheckout
        ? formatTime(d?.data?.checkOutAt)
        : formatTime(d?.data?.checkInAt),
      worked: isCheckout ? formatWorked(d?.data?.workedMinutes) : null,
      status: d?.data?.status,
      lateMinutes: d?.data?.lateMinutes || 0,
    });
    setPin("");
    console.log(overlay);

    const t = setTimeout(() => {
      setOverlay(null);
      pinMutation.reset();
    }, 3000);
    return () => clearTimeout(t);
  }, [pinMutation.isSuccess]);

  function onPress(d) {
    if (pinMutation.isPending) return;
    if (d === "del") return setPin((p) => p.slice(0, -1));
    if (d === "ok") return submit();
    setPin((p) => (p.length >= 8 ? p : p + String(d)));
  }

  function submit() {
    if (!pin || pin.length < 3) return;
    if (!hotelId) return;
    pinMutation.mutate({ hotelId, branchId, pin });
  }

  const busy = pinMutation.isPending;

  const isLate =
    !overlay?.isCheckout &&
    overlay?.status === "LATE" &&
    overlay?.lateMinutes > 0;

  return (
    <PageShell className="relative">
      <PageHeader title="ATTENDANCE" subtitle="Enter PIN to check in or out" />

      <div className="mx-auto mt-4 max-w-lg rounded-2xl border bg-muted/10 p-8 text-center shadow-sm">
        <div
          className="mb-6 rounded-xl border bg-background p-4 text-3xl font-mono tracking-[0.5em]"
          aria-label="PIN entry"
        >
          {pin.length > 0 ? "●".repeat(pin.length) : "—"}
        </div>

        {pinMutation.isError && (
          <div className="mb-4 text-sm text-rose-700">
            {pinMutation.error?.response?.data?.message || "Invalid PIN"}
          </div>
        )}

        <div className="space-y-2">
          {keypad.map((row, i) => (
            <div key={i} className="flex justify-center gap-2">
              {row.map((item) => (
                <PadButton
                  key={item}
                  value={item}
                  onClick={onPress}
                  disabled={busy}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button
            onClick={submit}
            disabled={busy || pin.length < 3}
            className="w-full rounded-xl py-6 text-lg"
            size="lg"
          >
            {busy ? "Processing…" : "Check In / Out"}
          </Button>
        </div>
      </div>

      {overlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className={`w-full max-w-sm rounded-2xl p-8 text-center shadow-xl ${
              isLate
                ? "bg-orange-50 border-2 border-orange-500"
                : "bg-emerald-50 border-2 border-emerald-500"
            }`}
          >
            {isLate ? (
              <AlertTriangle className="mx-auto h-12 w-12 text-orange-600" />
            ) : (
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            )}
            <h2 className="mt-4 text-2xl font-bold">
              {overlay.isCheckout
                ? `Goodbye ${overlay.name}`
                : isLate
                  ? `${overlay.name}`
                  : `Welcome ${overlay.name}`}
            </h2>
            {!overlay.isCheckout && overlay.role && (
              <p className="mt-1 text-sm text-muted-foreground">
                Role: {overlay.role}
              </p>
            )}
            {overlay.isCheckout ? (
              <p className="mt-4 text-lg font-semibold">Checked Out</p>
            ) : isLate ? (
              <>
                <p className="mt-4 text-lg font-semibold text-orange-700">
                  Warning: Late Arrival
                </p>

                <p className="mt-2 text-2xl font-bold text-orange-800">
                  {overlay.lateMinutes} minutes late
                </p>
              </>
            ) : (
              <>
                <p className="mt-4 text-lg font-semibold text-emerald-700">
                  Welcome! You're on time.
                </p>
              </>
            )}
            <p className="text-2xl font-mono">{overlay.time}</p>
            {overlay.worked && (
              <p className="mt-3 text-muted-foreground">
                Worked: <span className="font-semibold">{overlay.worked}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}
