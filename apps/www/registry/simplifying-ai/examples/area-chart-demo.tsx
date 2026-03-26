"use client"

import {
  AreaChart,
  generateAreaChartData,
} from "@/registry/simplifying-ai/ui/charts"

// Organic stock-like data with natural fluctuations, peak, and valley
const months = Array.from({ length: 30 }, (_, i) => `${i + 1}`)

const values = [
  42, 40, 38, 41, 36, 38, 45, 52, 58, 65, 72, 80, 88, 92, 86, 78, 70, 60, 52,
  48, 52, 45, 42, 45, 48, 44, 46, 42, 44, 45,
]

const chartData = generateAreaChartData(months, values)

export default function AreaChartDemo() {
  return (
    <AreaChart
      data={chartData}
      color="#2563eb"
      gradientFrom="#2563eb"
      gradientTo="#60a5fa"
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
