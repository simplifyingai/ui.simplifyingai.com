"use client"

import {
  AreaChart,
  generateAreaChartData,
} from "@/registry/simplifying-ai/ui/charts"

// Monthly data with natural fluctuations
const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

const values = [42, 38, 45, 58, 72, 88, 86, 70, 52, 45, 48, 44]

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
