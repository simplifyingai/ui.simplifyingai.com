"use client"

import { BoxPlotChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  {
    label: "Product A",
    values: [42, 48, 52, 55, 58, 62, 65, 68, 72, 75, 78, 82],
  },
  {
    label: "Product B",
    values: [35, 40, 45, 50, 55, 58, 62, 68, 72, 78, 85],
  },
  {
    label: "Product C",
    values: [28, 32, 38, 42, 48, 52, 55, 60, 65, 70],
  },
  {
    label: "Product D",
    values: [50, 55, 60, 65, 70, 75, 78, 82, 85, 88, 92],
  },
]

export default function BoxPlotChartHorizontalDemo() {
  return (
    <BoxPlotChart
      data={data}
      color="#2563eb"
      orientation="horizontal"
      showGrid
      showTooltip
      aspectRatio={1.5}
    />
  )
}
