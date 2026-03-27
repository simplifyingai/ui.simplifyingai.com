"use client"

import { RadarChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  {
    name: "Desktop",
    color: "#3b82f6",
    data: [
      { axis: "January", value: 186 },
      { axis: "February", value: 285 },
      { axis: "March", value: 237 },
      { axis: "April", value: 203 },
      { axis: "May", value: 209 },
      { axis: "June", value: 264 },
    ],
  },
]

export default function RadarChartFilledDemo() {
  return (
    <div className="w-full max-w-md">
      <RadarChart data={data} variant="filled" />
    </div>
  )
}
