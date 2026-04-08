"use client"

import { BarChart } from "@/registry/simplifying-ai/ui/charts"

// Page view data - 30 days of traffic
const chartData = [
  186, 205, 237, 173, 209, 214, 278, 312, 245, 289, 234, 276, 198, 267, 289,
  312, 256, 234, 289, 267, 298, 312, 278, 256, 234, 267, 289, 312, 334, 356,
].map((value, i) => ({
  label: `${i + 1}`,
  value,
}))

export default function BarChartDemo() {
  return (
    <BarChart
      data={chartData}
      showGrid
      showTooltip
      barRadius={0}
      aspectRatio={2.5}
    />
  )
}
