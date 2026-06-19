import { useMemo } from "react";
import {
  PageShell,
  PageHeader,
  KpiGrid,
  KpiCard,
  ContentGrid,
  AnalyticsCard,
  DataTable,
} from "@/components/ui/erp";
import { useWorkforceAnalytics } from "@/features/workforce/hooks/useWorkforceAnalytics";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  ChartWrapper,
  ChartTooltip,
  CHART_COLORS,
} from "@/components/ui/erp/ChartWrapper";
import { Users, UserCheck, Timer, UserX, Clock9 } from "lucide-react";

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

export default function AttendanceDashboard() {
  const q = useWorkforceAnalytics({}, { staleTime: 30_000 });

  // 💡 Extract loading states cleanly from the query object instance
  const isLoading = q.isLoading || q.isPending;

  const kpis = q.data?.kpis || {};
  const trend = q.data?.charts?.attendanceTrend || [];
  const topLate = q.data?.insights?.topLateEmployees || [];
  const topOvertime = q.data?.insights?.topOvertimeEmployees || [];

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

  return (
    <PageShell>
      <PageHeader
        title="Attendance Dashboard"
        subtitle="Daily and historical workforce attendance"
      />

      <KpiGrid cols={5}>
        <KpiCard
          label="Total roster"
          value={kpis.totalEmployees ?? "—"}
          hint="Total registered workforce"
          icon={Users}
          accent="blue"
          loading={isLoading}
        />

        <KpiCard
          label="Present today"
          value={kpis.presentToday ?? "—"}
          hint="Staff checked-in on site"
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
          hint="No login status recorded"
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
          hint="Accumulated extra shift duration"
          icon={Clock9}
          accent="purple"
          loading={isLoading}
        />
      </KpiGrid>

      <ContentGrid>
        <AnalyticsCard
          title="Attendance Trend (last 30 days)"
          description="Daily present vs late"
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
          title="Reports"
          description="Export attendance reports"
          accent="blue"
        >
          <div className="p-4">
            Use the export controls to download CSV/Excel/PDF (coming soon)
          </div>
        </AnalyticsCard>
      </ContentGrid>
    </PageShell>
  );
}
