"use client"

import {
  AreaChart,
  generateAreaChartData,
} from "@/registry/simplifying-ai/ui/charts"

// Organic stock-like data with step transitions
const months = Array.from({ length: 30 }, (_, i) => `${i + 1}`)

const values = [
  38, 42, 38, 35, 42, 52, 62, 72, 85, 92, 95, 88, 78, 68, 58, 52, 48, 52, 58,
  52, 48, 45, 50, 55, 58, 52, 48, 50, 52, 50,
]

const chartData = generateAreaChartData(months, values)

export default function AreaChartStepDemo() {
  return (
    <AreaChart
      data={chartData}
      color="#10b981"
      gradientFrom="#10b981"
      gradientTo="#6ee7b7"
      showDots={false}
      showGrid
      showTooltip
      yAxisDomain={[0, 100]}
      yAxisTicks={[25, 50, 75, 100]}
      aspectRatio={2}
      xAxisAngle={0}
      curveType="step"
    />
  )
}
