"use client"

import { HeatmapChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { x: "Mon", y: "Morning", value: 5 },
  { x: "Mon", y: "Afternoon", value: 8 },
  { x: "Mon", y: "Evening", value: 3 },
  { x: "Tue", y: "Morning", value: 7 },
  { x: "Tue", y: "Afternoon", value: 9 },
  { x: "Tue", y: "Evening", value: 4 },
  { x: "Wed", y: "Morning", value: 6 },
  { x: "Wed", y: "Afternoon", value: 10 },
  { x: "Wed", y: "Evening", value: 5 },
  { x: "Thu", y: "Morning", value: 4 },
  { x: "Thu", y: "Afternoon", value: 7 },
  { x: "Thu", y: "Evening", value: 6 },
  { x: "Fri", y: "Morning", value: 8 },
  { x: "Fri", y: "Afternoon", value: 6 },
  { x: "Fri", y: "Evening", value: 9 },
]

export default function HeatmapChartDemo() {
  return (
    <div className="w-full max-w-3xl">
      <HeatmapChart
        data={data}
        xAxisLabel="Day"
        yAxisLabel="Time"
        colorScale={["#f0f9ff", "#0369a1"]}
      />
    </div>
  )
}
