"use client"

import * as React from "react"
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
  { date: "2024-04-01", desktop: 222, mobile: 150 },
  { date: "2024-04-02", desktop: 97, mobile: 180 },
  { date: "2024-04-03", desktop: 167, mobile: 120 },
  { date: "2024-04-04", desktop: 242, mobile: 260 },
  { date: "2024-04-05", desktop: 373, mobile: 290 },
  { date: "2024-04-06", desktop: 301, mobile: 340 },
  { date: "2024-04-07", desktop: 245, mobile: 180 },
  { date: "2024-04-08", desktop: 409, mobile: 320 },
  { date: "2024-04-09", desktop: 59, mobile: 110 },
  { date: "2024-04-10", desktop: 261, mobile: 190 },
  { date: "2024-04-11", desktop: 327, mobile: 350 },
  { date: "2024-04-12", desktop: 292, mobile: 210 },
  { date: "2024-04-13", desktop: 342, mobile: 380 },
  { date: "2024-04-14", desktop: 137, mobile: 220 },
  { date: "2024-04-15", desktop: 120, mobile: 170 },
  { date: "2024-04-16", desktop: 138, mobile: 190 },
  { date: "2024-04-17", desktop: 446, mobile: 360 },
  { date: "2024-04-18", desktop: 364, mobile: 410 },
  { date: "2024-04-19", desktop: 243, mobile: 180 },
  { date: "2024-04-20", desktop: 89, mobile: 150 },
]

export default function BarChartInteractiveDemo() {
  const [activeChart, setActiveChart] = React.useState<"desktop" | "mobile">(
    "desktop"
  )

  const total = React.useMemo(
    () => ({
      desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0),
    }),
    []
  )

  return (
    <div className="w-full">
      {/* Header with toggles */}
      <div className="flex">
        <button
          className={`flex flex-1 flex-col justify-center gap-1 border-b px-6 py-4 text-left transition-colors even:border-l sm:border-l sm:px-8 sm:py-6 ${
            activeChart === "desktop" ? "bg-muted/50" : "hover:bg-muted/30"
          }`}
          onClick={() => setActiveChart("desktop")}
        >
          <span className="text-muted-foreground text-xs">Desktop</span>
          <span className="text-foreground text-lg leading-none font-bold sm:text-3xl">
            {total.desktop.toLocaleString()}
          </span>
        </button>
        <button
          className={`flex flex-1 flex-col justify-center gap-1 border-b px-6 py-4 text-left transition-colors even:border-l sm:border-l sm:px-8 sm:py-6 ${
            activeChart === "mobile" ? "bg-muted/50" : "hover:bg-muted/30"
          }`}
          onClick={() => setActiveChart("mobile")}
        >
          <span className="text-muted-foreground text-xs">Mobile</span>
          <span className="text-foreground text-lg leading-none font-bold sm:text-3xl">
            {total.mobile.toLocaleString()}
          </span>
        </button>
      </div>

      {/* Chart */}
      <div className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ResponsiveContainer width="100%" aspect={2.5}>
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
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
              tickMargin={8}
              minTickGap={32}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted-foreground))", opacity: 0.08 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const date = new Date(label)
                return (
                  <div className="bg-background rounded-lg border px-3 py-2 shadow-lg">
                    <p className="text-foreground text-sm font-medium">
                      {date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p
                      className="text-sm"
                      style={{
                        color:
                          activeChart === "desktop" ? "#2563eb" : "#60a5fa",
                      }}
                    >
                      {activeChart === "desktop" ? "Desktop" : "Mobile"}:{" "}
                      {payload[0]?.value}
                    </p>
                  </div>
                )
              }}
            />
            <Bar
              dataKey={activeChart}
              fill={activeChart === "desktop" ? "#2563eb" : "#60a5fa"}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
