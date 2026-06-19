import { useEffect, useState } from "react";
import { usePinMutation } from "@/features/workforce/hooks/useWorkforce";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { PageShell, PageHeader } from "@/components/ui/erp";
import { Button } from "@/components/ui/button";

function PadButton({ value, onClick }) {
  return (
    <button
      onClick={() => onClick(value)}
      className="m-1 h-16 w-16 rounded-lg border bg-card text-xl font-semibold"
    >
      {value}
    </button>
  );
}

export default function AttendanceTerminal() {
  const user = useAuthStore((s) => s.user);
  const hotelId = user?.hotel?.id;
  const branchId = user?.branch?.id;

  const [pin, setPin] = useState("");
  const [message, setMessage] = useState(null);

  const pinMutation = usePinMutation();

  useEffect(() => {
    if (pinMutation.isSuccess) {
      const d = pinMutation.data;
      setMessage({ ok: true, text: d.message || "Success", details: d.data });
      setPin("");
      const t = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(t);
    }
    if (pinMutation.isError) {
      setMessage({
        ok: false,
        text: pinMutation.error?.response?.data?.message || "Error",
      });
    }
  }, [pinMutation.isSuccess, pinMutation.isError]);

  function onPress(d) {
    if (d === "del") return setPin((p) => p.slice(0, -1));
    if (d === "ok") return submit();
    setPin((p) => (p.length >= 8 ? p : p + String(d)));
  }

  function submit() {
    if (!hotelId)
      return setMessage({ ok: false, text: "Missing hotel context" });
    pinMutation.mutate({ hotelId, branchId, pin });
  }

  return (
    <PageShell>
      <PageHeader title="Attendance" subtitle="Enter PIN to check in/out" />

      <div className="mx-auto mt-6 max-w-md rounded-xl border bg-muted/10 p-6 text-center">
        <div className="mb-4">
          <input
            value={"●".repeat(pin.length)}
            readOnly
            className="mb-3 w-full rounded-md border bg-white/80 p-3 text-center text-2xl font-mono"
          />
          {message ? (
            <div
              className={`p-3 text-sm ${message.ok ? "text-emerald-700" : "text-rose-700"}`}
            >
              <div className="font-semibold">{message.text}</div>
              {message.details?.employee ? (
                <div className="text-xs">
                  {message.details.employee.firstName}{" "}
                  {message.details.employee.lastName}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <PadButton key={n} value={n} onClick={onPress} />
          ))}
          <PadButton value={"del"} onClick={onPress} />
          <PadButton value={0} onClick={onPress} />
          <PadButton value={"ok"} onClick={onPress} />
        </div>

        <div className="mt-4">
          <Button onClick={submit} className="w-full">
            Check In / Out
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
