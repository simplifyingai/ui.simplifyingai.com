"use client"

import { RadarChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  {
    name: "Desktop",
    color: "#3b82f6",
    data: [
      { axis: "January", value: 186 },
      { axis: "February", value: 305 },
      { axis: "March", value: 237 },
      { axis: "April", value: 273 },
      { axis: "May", value: 209 },
      { axis: "June", value: 214 },
    ],
  },
]

export default function RadarChartMinimalDemo() {
  return (
    <div className="w-full max-w-md">
      <RadarChart data={data} variant="minimal" />
    </div>
  )
}
