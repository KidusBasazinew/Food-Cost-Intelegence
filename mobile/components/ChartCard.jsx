import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { LineChart } from "react-native-gifted-charts";

const PRIMARY = "#4F378A";
const PRIMARY_LIGHT = "#E9DDFF";
const TERTIARY = "#633B48";
const TERTIARY_LIGHT = "#FFD9E3";

/**
 * Reusable multi-metric chart card.
 * `series` = [{ key, label, color, lightColor, data: [{ value, label }], formatValue }]
 * Renders a segmented toggle (All + one per series) above the chart(s).
 */
export function ChartCard({ title, series }) {
  const [active, setActive] = useState("ALL");

  const renderChart = (s, height = 160) => (
    <LineChart
      data={s.data}
      height={height}
      color={s.color}
      thickness={2.5}
      curved
      areaChart
      startFillColor={s.lightColor}
      startOpacity={1}
      endFillColor={s.lightColor}
      endOpacity={0.05}
      dataPointsColor={s.color}
      dataPointsRadius={4}
      hideRules
      yAxisTextStyle={{ color: "#79747E", fontSize: 10, fontFamily: "Popines" }}
      xAxisLabelTextStyle={{ color: "#79747E", fontSize: 10 }}
      xAxisColor="#CBC4D2"
      yAxisColor="transparent"
      noOfSections={3}
      spacing={40}
      initialSpacing={16}
    />
  );

  return (
    <View className="bg-surface-container-low rounded-3xl p-4 border border-outline-variant/20">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="font-semibold text-base text-on-surface">{title}</Text>
      </View>

      {/* Segmented toggle */}
      <View className="flex-row bg-surface-container-highest rounded-full p-1 mb-4">
        <Pressable
          onPress={() => setActive("ALL")}
          className={`flex-1 py-2 rounded-full items-center ${active === "ALL" ? "bg-primary" : ""}`}
        >
          <Text
            className={`font-semibold text-xs ${active === "ALL" ? "text-on-primary" : "text-on-surface-variant"}`}
          >
            All
          </Text>
        </Pressable>
        {series.map((s) => (
          <Pressable
            key={s.key}
            onPress={() => setActive(s.key)}
            className={`flex-1 py-2 rounded-full items-center ${active === s.key ? "bg-primary" : ""}`}
          >
            <Text
              className={`font-semibold text-xs ${active === s.key ? "text-on-primary" : "text-on-surface-variant"}`}
            >
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart(s) */}
      {active === "ALL" ? (
        <View className="gap-5">
          {series.map((s) => (
            <View key={s.key}>
              <View className="flex-row items-center justify-between mb-1 px-1">
                <View className="flex-row items-center gap-1.5">
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: s.color,
                    }}
                  />
                  <Text className="font-regular text-xs text-on-surface-variant">
                    {s.label}
                  </Text>
                </View>
                {s.formatValue && (
                  <Text className="font-semibold text-xs text-on-surface">
                    {s.formatValue(s.data[s.data.length - 1].value)}
                  </Text>
                )}
              </View>
              {renderChart(s, 110)}
            </View>
          ))}
        </View>
      ) : (
        (() => {
          const s = series.find((x) => x.key === active);
          return (
            <View>
              {s.formatValue && (
                <Text className="font-semibold text-2xl text-on-surface mb-2 px-1">
                  {s.formatValue(s.data[s.data.length - 1].value)}
                </Text>
              )}
              {renderChart(s, 180)}
            </View>
          );
        })()
      )}
    </View>
  );
}

export const CHART_COLORS = {
  PRIMARY,
  PRIMARY_LIGHT,
  TERTIARY,
  TERTIARY_LIGHT,
};
