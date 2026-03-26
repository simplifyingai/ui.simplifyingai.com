"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const chartData = [
  { month: "January", value: 186 },
  { month: "February", value: -125 },
  { month: "March", value: 237 },
  { month: "April", value: -73 },
  { month: "May", value: 209 },
  { month: "June", value: -156 },
]

export default function BarChartNegativeDemo() {
  return (
    <div className="w-full max-w-md">
      <ResponsiveContainer width="100%" aspect={1.5}>
        <BarChart
          data={chartData}
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 40,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="hsl(var(--border))"
            strokeOpacity={0.5}
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.slice(0, 3)}
            tickMargin={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            width={40}
          />
          <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted-foreground))", opacity: 0.08 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const value = payload[0]?.value as number
              return (
                <div className="bg-background rounded-lg border px-3 py-2 shadow-lg">
                  <p className="text-foreground text-sm font-medium">{label}</p>
                  <p
                    className="text-sm"
                    style={{ color: value >= 0 ? "#2563eb" : "#60a5fa" }}
                  >
                    Value: {value}
                  </p>
                </div>
              )
            }}
          />
          <Bar dataKey="value" radius={4}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value >= 0 ? "#2563eb" : "#60a5fa"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
