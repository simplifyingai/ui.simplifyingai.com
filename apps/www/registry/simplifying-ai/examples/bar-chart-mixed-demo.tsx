"use client"

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const chartData = [
  { month: "January", desktop: 186, trend: 160 },
  { month: "February", desktop: 305, trend: 220 },
  { month: "March", desktop: 237, trend: 250 },
  { month: "April", desktop: 73, trend: 180 },
  { month: "May", desktop: 209, trend: 200 },
  { month: "June", desktop: 214, trend: 230 },
]

export default function BarChartMixedDemo() {
  return (
    <div className="w-full max-w-md">
      <ResponsiveContainer width="100%" aspect={1.5}>
        <ComposedChart
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
            width={36}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted-foreground))", opacity: 0.08 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="bg-background rounded-lg border px-3 py-2 shadow-lg">
                  <p className="text-foreground mb-1 text-sm font-medium">
                    {label}
                  </p>
                  {payload.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div
                        className="size-2 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-muted-foreground">
                        {entry.name}:
                      </span>
                      <span style={{ color: entry.color }}>{entry.value}</span>
                    </div>
                  ))}
                </div>
              )
            }}
          />
          <Bar dataKey="desktop" name="Desktop" fill="#2563eb" radius={4} />
          <Line
            type="monotone"
            dataKey="trend"
            name="Trend"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={{ r: 4, fill: "#60a5fa" }}
            activeDot={{ r: 6, fill: "#60a5fa" }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="size-3 rounded-sm bg-[#2563eb]" />
          <span className="text-muted-foreground">Desktop</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="h-0.5 w-3 rounded-full bg-[#60a5fa]" />
          <span className="text-muted-foreground">Trend</span>
        </div>
      </div>
    </div>
  )
}
