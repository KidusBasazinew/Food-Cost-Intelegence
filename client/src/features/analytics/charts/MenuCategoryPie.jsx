import { Cell, Pie, PieChart, Tooltip } from "recharts";

import { ChartTooltip, ChartWrapper, CHART_COLORS } from "@/components/ui/erp";

export function MenuCategoryPie({ counts = {} }) {
  const data = [
    { name: "Star", value: counts.STAR || 0 },
    { name: "Puzzle", value: counts.PUZZLE || 0 },
    { name: "Plowhorse", value: counts.PLOWHORSE || 0 },
    { name: "Dog", value: counts.DOG || 0 },
  ].filter((d) => d.value > 0);

  return (
    <ChartWrapper empty={data.length === 0} height={260}>
      <PieChart>
        <Tooltip content={<ChartTooltip />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS.palette[i % CHART_COLORS.palette.length]} />
          ))}
        </Pie>
      </PieChart>
    </ChartWrapper>
  );
}
