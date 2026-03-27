"use client"

import { RadarChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  {
    name: "Desktop",
    color: "#2563eb",
    data: [
      { axis: "January", value: 186 },
      { axis: "February", value: 305 },
      { axis: "March", value: 237 },
      { axis: "April", value: 73 },
      { axis: "May", value: 209 },
      { axis: "June", value: 214 },
    ],
  },
  {
    name: "Mobile",
    color: "#93c5fd",
    data: [
      { axis: "January", value: 80 },
      { axis: "February", value: 200 },
      { axis: "March", value: 120 },
      { axis: "April", value: 190 },
      { axis: "May", value: 130 },
      { axis: "June", value: 140 },
    ],
  },
]

export default function RadarChartComparisonDemo() {
  return (
    <div className="w-full max-w-md">
      <RadarChart data={data} variant="comparison" />
    </div>
  )
}
