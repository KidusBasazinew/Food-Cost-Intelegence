import { useMemo, useState } from "react";
import {
  PageShell,
  PageHeader,
  KpiGrid,
  KpiCard,
  ContentGrid,
  AnalyticsCard,
  DataTable,
} from "@/components/ui/erp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkforceAnalytics } from "@/features/workforce/hooks/useWorkforceAnalytics";
import { useEmployeeSummariesQuery } from "@/features/workforce/hooks/useWorkforce";
import { reportsApi } from "@/features/analytics/api/reportsApi";
import {
  isoEndOfDay,
  isoStartOfDay,
  daysAgoISODate,
  todayISODate,
} from "@/features/analytics/utils/dates";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import {
  ChartWrapper,
  ChartTooltip,
  CHART_COLORS,
} from "@/components/ui/erp/ChartWrapper";
import { Users, UserCheck, Timer, UserX, Clock9 } from "lucide-react";

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

function AttendanceTrendChart({ data = [] }) {
  return (
    <ChartWrapper height={280} empty={data.length === 0}>
      <AreaChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={CHART_COLORS.primary}
              stopOpacity={0.35}
            />
            <stop
              offset="100%"
              stopColor={CHART_COLORS.primary}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
        />
        <YAxis tick={{ fontSize: 11 }} width={72} />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="present"
          stroke={CHART_COLORS.primary}
          fill="url(#presentGrad)"
          strokeWidth={2}
          dot={false}
          name="Present"
        />
        <Area
          type="monotone"
          dataKey="late"
          stroke={CHART_COLORS.warning}
          fillOpacity={0}
          strokeWidth={2}
          dot={false}
          name="Late"
        />
      </AreaChart>
    </ChartWrapper>
  );
}

function AttendancePercentChart({ data = [] }) {
  return (
    <ChartWrapper height={280} empty={data.length === 0}>
      <BarChart data={data.slice(0, 10)} margin={{ left: 8, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10 }}
          interval={0}
          angle={-25}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fontSize: 11 }} width={48} domain={[0, 100]} />
        <Tooltip content={<ChartTooltip />} />
        <Bar
          dataKey="attendancePercent"
          fill={CHART_COLORS.primary}
          name="Attendance %"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartWrapper>
  );
}

const PERIOD_PRESETS = [
  { id: "daily", label: "Today", days: 0 },
  { id: "weekly", label: "Weekly", days: 6 },
  { id: "monthly", label: "Monthly", days: 29 },
  { id: "custom", label: "Custom", days: null },
];

export default function AttendanceDashboard() {
  const [period, setPeriod] = useState("monthly");
  const [fromDate, setFromDate] = useState(daysAgoISODate(29));
  const [toDate, setToDate] = useState(todayISODate());
  const [exportFormat, setExportFormat] = useState("csv");
  const [exportBusy, setExportBusy] = useState(false);

  const analyticsParams = useMemo(
    () => ({
      from: isoStartOfDay(fromDate),
      to: isoEndOfDay(toDate),
    }),
    [fromDate, toDate],
  );

  const q = useWorkforceAnalytics(analyticsParams, { staleTime: 30_000 });
  const summariesQ = useEmployeeSummariesQuery(analyticsParams, {
    staleTime: 30_000,
  });

  const isLoading = q.isLoading || q.isPending;
  const kpis = q.data?.kpis || {};
  const trend = q.data?.charts?.attendanceTrend || [];
  const topLate = q.data?.insights?.topLateEmployees || [];
  const topOvertime = q.data?.insights?.topOvertimeEmployees || [];
  const attendancePct = q.data?.insights?.attendancePercentage || [];
  const summaries = summariesQ.data || [];

  function applyPreset(id) {
    setPeriod(id);
    const preset = PERIOD_PRESETS.find((p) => p.id === id);
    if (preset?.days !== null && preset) {
      setFromDate(
        preset.days === 0 ? todayISODate() : daysAgoISODate(preset.days),
      );
      setToDate(todayISODate());
    }
  }

  async function onExport() {
    setExportBusy(true);
    try {
      const blob = await reportsApi.export({
        type: "ATTENDANCE",
        format: exportFormat,
        params: analyticsParams,
      });
      downloadBlob(blob, `ATTENDANCE.${exportFormat}`);
    } finally {
      setExportBusy(false);
    }
  }

  const lateColumns = useMemo(
    () => [
      { accessorKey: "name", header: "Employee" },
      { accessorKey: "count", header: "Late Count" },
    ],
    [],
  );

  const overtimeColumns = useMemo(
    () => [
      { accessorKey: "name", header: "Employee" },
      {
        accessorKey: "minutes",
        header: "Overtime (min)",
        cell: ({ getValue }) => getValue(),
      },
    ],
    [],
  );

  const summaryColumns = useMemo(
    () => [
      { accessorKey: "employeeCode", header: "Code" },
      { accessorKey: "name", header: "Employee" },
      { accessorKey: "presentDays", header: "Present Days" },
      { accessorKey: "absentDays", header: "Absent Days" },
      { accessorKey: "lateCount", header: "Late Count" },
      {
        accessorKey: "totalHoursWorked",
        header: "Hours Worked",
        cell: ({ getValue }) => getValue(),
      },
      {
        accessorKey: "totalOvertimeMinutes",
        header: "Overtime (min)",
        cell: ({ getValue }) => getValue(),
      },
      {
        accessorKey: "attendancePercent",
        header: "Attendance %",
        cell: ({ getValue }) => `${getValue()}%`,
      },
    ],
    [],
  );

  return (
    <PageShell>
      <PageHeader
        title="Attendance Reports"
        subtitle="Daily, weekly, and monthly workforce attendance analytics"
      />

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
        <div className="flex flex-wrap gap-2">
          {PERIOD_PRESETS.map((p) => (
            <Button
              key={p.id}
              size="sm"
              variant={period === p.id ? "default" : "outline"}
              onClick={() => applyPreset(p.id)}
            >
              {p.label}
            </Button>
          ))}
        </div>
        {period === "custom" && (
          <>
            <div>
              <div className="text-xs text-muted-foreground">From</div>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">To</div>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </>
        )}
        <div>
          <div className="text-xs text-muted-foreground">Export format</div>
          <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
          >
            <option value="csv">CSV</option>
            <option value="xlsx">Excel</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
        <Button onClick={onExport} disabled={exportBusy}>
          {exportBusy ? "Exporting…" : "Export Report"}
        </Button>
      </div>

      <KpiGrid cols={5}>
        <KpiCard
          label="Employees today"
          value={kpis.totalEmployees ?? "—"}
          hint="Active roster size"
          icon={Users}
          accent="blue"
          loading={isLoading}
        />
        <KpiCard
          label="Present today"
          value={kpis.presentToday ?? "—"}
          hint="Staff checked in on site"
          icon={UserCheck}
          accent="emerald"
          loading={isLoading}
        />
        <KpiCard
          label="Late today"
          value={kpis.lateToday ?? "—"}
          hint="Arrivals past schedule"
          icon={Timer}
          accent="amber"
          loading={isLoading}
        />
        <KpiCard
          label="Absent today"
          value={kpis.absentToday ?? "—"}
          hint="No attendance recorded"
          icon={UserX}
          accent="rose"
          loading={isLoading}
        />
        <KpiCard
          label="Overtime today"
          value={
            kpis.overtimeTodayMinutes
              ? `${Math.floor(kpis.overtimeTodayMinutes / 60)}h ${kpis.overtimeTodayMinutes % 60}m`
              : "—"
          }
          hint="Extra hours worked today"
          icon={Clock9}
          accent="purple"
          loading={isLoading}
        />
      </KpiGrid>

      <ContentGrid>
        <AnalyticsCard
          title="Attendance Trend"
          description="Daily attendance — last 30 days"
          accent="purple"
        >
          <AttendanceTrendChart data={trend} />
        </AnalyticsCard>

        <AnalyticsCard
          title="Top Late Employees"
          description="Top 10 by late count"
          accent="amber"
        >
          <DataTable
            columns={lateColumns}
            data={topLate}
            enableSearch={false}
            pageSize={10}
          />
        </AnalyticsCard>
      </ContentGrid>

      <ContentGrid>
        <AnalyticsCard
          title="Top Overtime"
          description="Top employees by overtime minutes"
          accent="emerald"
        >
          <DataTable
            columns={overtimeColumns}
            data={topOvertime}
            enableSearch={false}
            pageSize={10}
          />
        </AnalyticsCard>

        <AnalyticsCard
          title="Attendance Percentage"
          description="Per employee for selected period"
          accent="blue"
        >
          <AttendancePercentChart data={attendancePct} />
        </AnalyticsCard>
      </ContentGrid>

      <div className="mt-6">
        <AnalyticsCard
          title="Employee Summary"
          description="Present, absent, late, hours, overtime, and attendance %"
          accent="blue"
        >
          <DataTable
            columns={summaryColumns}
            data={summaries}
            loading={summariesQ.isLoading}
            pageSize={15}
            emptyTitle="No data"
            emptyDescription="No attendance records for the selected period."
          />
        </AnalyticsCard>
      </div>
    </PageShell>
  );
}
