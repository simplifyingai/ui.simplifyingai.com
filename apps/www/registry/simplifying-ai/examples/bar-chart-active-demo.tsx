"use client"

import {
  Bar,
  BarChart,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const chartData = [
  { month: "January", sales: 187, fill: "#93c5fd" },
  { month: "February", sales: 200, fill: "#3b82f6" },
  { month: "March", sales: 275, fill: "#2563eb" },
  { month: "April", sales: 173, fill: "#1d4ed8" },
  { month: "May", sales: 209, fill: "#1e40af" },
]

// Index of the active (highlighted) bar
const ACTIVE_INDEX = 2

interface BarShapeProps {
  x?: number
  y?: number
  width?: number
  height?: number
  fill?: string
  index?: number
  payload?: { fill: string }
  radius?: number | [number, number, number, number]
}

export default function BarChartActiveDemo() {
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
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.slice(0, 3)}
            tickMargin={10}
          />
          <YAxis hide />
          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const data = payload[0]
              return (
                <div className="bg-background flex items-center gap-2 rounded-lg border px-3 py-2 shadow-lg">
                  <div
                    className="size-3 rounded-sm"
                    style={{ backgroundColor: data.payload?.fill }}
                  />
                  <span className="text-muted-foreground text-sm">Sales</span>
                  <span className="text-foreground text-sm font-medium">
                    {data.value}
                  </span>
                </div>
              )
            }}
          />
          <Bar
            dataKey="sales"
            radius={12}
            shape={({ index, fill, ...props }: BarShapeProps) =>
              index === ACTIVE_INDEX ? (
                <Rectangle
                  {...props}
                  fill={fill}
                  fillOpacity={0.6}
                  stroke={fill}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              ) : (
                <Rectangle {...props} fill={fill} />
              )
            }
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
