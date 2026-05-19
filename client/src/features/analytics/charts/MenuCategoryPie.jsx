import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export function MenuCategoryPie({ counts = {} }) {
  const data = [
    { name: "Star", value: counts.STAR || 0 },
    { name: "Puzzle", value: counts.PUZZLE || 0 },
    { name: "Plowhorse", value: counts.PLOWHORSE || 0 },
    { name: "Dog", value: counts.DOG || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div style={{ height: 260 }}>
      {data.length === 0 ? (
        <div className="text-sm text-muted-foreground">No data yet.</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              fill="currentColor"
              label
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
