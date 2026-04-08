"use client"

import {
  AreaChart,
  generateAreaChartData,
} from "@/registry/simplifying-ai/ui/charts"

// Quarterly data
const months = ["Q1", "Q2", "Q3", "Q4", "Q1", "Q2", "Q3", "Q4"]

const values = [42, 58, 88, 70, 45, 72, 86, 64]

const chartData = generateAreaChartData(months, values)

export default function AreaChartDemo() {
  return (
    <AreaChart
      data={chartData}
      showDots={false}
      showGrid
      showTooltip
      yAxisDomain={[0, 100]}
      yAxisTicks={[25, 50, 75, 100]}
      aspectRatio={2}
      xAxisAngle={0}
      curveType="linear"
    />
  )
}
