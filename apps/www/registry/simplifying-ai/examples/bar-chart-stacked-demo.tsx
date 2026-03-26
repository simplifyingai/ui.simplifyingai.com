"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

export default function BarChartStackedDemo() {
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
            width={36}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted-foreground))", opacity: 0.08 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const total = payload.reduce(
                (sum, entry) => sum + (entry.value as number),
                0
              )
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
                  <div className="text-muted-foreground mt-1 border-t pt-1 text-sm">
                    Total: {total}
                  </div>
                </div>
              )
            }}
          />
          <Bar
            dataKey="desktop"
            fill="#2563eb"
            stackId="stack"
            radius={[0, 0, 4, 4]}
          />
          <Bar
            dataKey="mobile"
            fill="#60a5fa"
            stackId="stack"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="size-3 rounded-sm bg-[#2563eb]" />
          <span className="text-muted-foreground">Desktop</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="size-3 rounded-sm bg-[#60a5fa]" />
          <span className="text-muted-foreground">Mobile</span>
        </div>
      </div>
    </div>
  )
}
