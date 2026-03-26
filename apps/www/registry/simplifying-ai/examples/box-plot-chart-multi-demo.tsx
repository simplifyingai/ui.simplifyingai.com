"use client"

import { BoxPlotChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  {
    label: "Q1",
    values: [45, 52, 58, 62, 68, 72, 75, 78, 82, 85, 88, 92],
    color: "#93c5fd",
  },
  {
    label: "Q2",
    values: [55, 60, 65, 70, 75, 80, 85, 88, 92, 95, 98],
    color: "#3b82f6",
  },
  {
    label: "Q3",
    values: [62, 68, 72, 78, 82, 85, 88, 92, 95, 100, 105],
    color: "#2563eb",
  },
  {
    label: "Q4",
    values: [70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120],
    color: "#1d4ed8",
  },
]

export default function BoxPlotChartMultiDemo() {
  return (
    <BoxPlotChart
      data={data}
      showGrid
      showTooltip
      showOutliers
      aspectRatio={2}
    />
  )
}
