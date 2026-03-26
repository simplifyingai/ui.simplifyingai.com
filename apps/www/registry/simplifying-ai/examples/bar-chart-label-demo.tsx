"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
]

export default function BarChartLabelDemo() {
  return (
    <div className="w-full max-w-md">
      <ResponsiveContainer width="100%" aspect={1.5}>
        <BarChart
          data={chartData}
          margin={{
            top: 30,
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
          <YAxis hide />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted-foreground))", opacity: 0.08 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="bg-background rounded-lg border px-3 py-2 shadow-lg">
                  <p className="text-foreground text-sm font-medium">{label}</p>
                  <p className="text-sm" style={{ color: "#2563eb" }}>
                    Desktop: {payload[0]?.value}
                  </p>
                </div>
              )
            }}
          />
          <Bar dataKey="desktop" fill="#2563eb" radius={8}>
            <LabelList
              dataKey="desktop"
              position="top"
              offset={12}
              className="fill-foreground"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
