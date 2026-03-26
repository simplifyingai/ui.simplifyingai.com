"use client"

import { LineChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  {
    name: "Users",
    data: [
      { x: "Jan", y: 1200 },
      { x: "Feb", y: 1900 },
      { x: "Mar", y: 1700 },
      { x: "Apr", y: 2400 },
      { x: "May", y: 2800 },
      { x: "Jun", y: 3200 },
    ],
  },
  {
    name: "Sessions",
    data: [
      { x: "Jan", y: 2400 },
      { x: "Feb", y: 3200 },
      { x: "Mar", y: 2900 },
      { x: "Apr", y: 4100 },
      { x: "May", y: 4800 },
      { x: "Jun", y: 5500 },
    ],
  },
]

const config = {
  Users: { label: "Users", color: "var(--chart-1)" },
  Sessions: { label: "Sessions", color: "var(--chart-2)" },
}

export default function LineChartDemo() {
  return (
    <div className="w-full max-w-3xl">
      <LineChart
        data={data}
        config={config}
        showLegend
        showDots
        xAxisLabel="Month"
        yAxisLabel="Count"
      />
    </div>
  )
}
