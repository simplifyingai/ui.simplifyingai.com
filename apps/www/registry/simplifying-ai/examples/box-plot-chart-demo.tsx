"use client"

import { BoxPlotChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  {
    label: "January",
    values: [20, 25, 30, 35, 40, 45, 50, 52, 55, 60, 65, 70, 75, 80],
  },
  {
    label: "February",
    values: [15, 22, 28, 32, 38, 42, 48, 55, 58, 62, 68, 72, 78, 85, 90],
  },
  {
    label: "March",
    values: [10, 18, 25, 30, 35, 40, 42, 45, 48, 52, 55, 60],
  },
  {
    label: "April",
    values: [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75],
  },
  {
    label: "May",
    values: [18, 22, 28, 35, 42, 48, 52, 58, 62, 68, 72, 78],
  },
]

export default function BoxPlotChartDemo() {
  return (
    <BoxPlotChart
      data={data}
      color="#2563eb"
      showGrid
      showTooltip
      showOutliers
      aspectRatio={2}
    />
  )
}
