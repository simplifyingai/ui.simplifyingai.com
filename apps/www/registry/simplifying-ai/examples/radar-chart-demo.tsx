"use client"

import { RadarChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  {
    name: "Product A",
    color: "#2563eb",
    data: [
      { axis: "Performance", value: 85 },
      { axis: "Reliability", value: 90 },
      { axis: "Usability", value: 78 },
      { axis: "Features", value: 88 },
      { axis: "Support", value: 72 },
      { axis: "Price", value: 65 },
    ],
  },
  {
    name: "Product B",
    color: "#93c5fd",
    data: [
      { axis: "Performance", value: 72 },
      { axis: "Reliability", value: 85 },
      { axis: "Usability", value: 90 },
      { axis: "Features", value: 75 },
      { axis: "Support", value: 88 },
      { axis: "Price", value: 80 },
    ],
  },
]

export default function RadarChartDemo() {
  return (
    <div className="w-full max-w-md">
      <RadarChart data={data} showLegend fillOpacity={0.3} />
    </div>
  )
}
