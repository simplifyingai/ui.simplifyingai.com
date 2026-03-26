"use client"

import {
  AreaChart,
  generateAreaChartData,
} from "@/registry/simplifying-ai/ui/charts"

// Organic stock-like data with natural fluctuations
const months = Array.from({ length: 30 }, (_, i) => `${i + 1}`)

const values = [
  45, 42, 38, 35, 40, 48, 55, 65, 75, 85, 92, 95, 90, 82, 72, 62, 55, 52, 58,
  62, 55, 50, 55, 60, 65, 68, 72, 75, 72, 78,
]

const chartData = generateAreaChartData(months, values)

export default function AreaChartSmoothDemo() {
  return (
    <AreaChart
      data={chartData}
      color="#8b5cf6"
      gradientFrom="#8b5cf6"
      gradientTo="#c4b5fd"
      showDots={false}
      showGrid
      showTooltip
      yAxisDomain={[0, 100]}
      yAxisTicks={[25, 50, 75, 100]}
      aspectRatio={2}
      xAxisAngle={0}
      curveType="monotone"
    />
  )
}
