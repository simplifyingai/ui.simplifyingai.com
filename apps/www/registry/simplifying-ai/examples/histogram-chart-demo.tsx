"use client"

import { HistogramChart } from "@/registry/simplifying-ai/ui/charts"

// Generate normal distribution data using Box-Muller transform
function generateNormalData(n: number, mean: number, stdDev: number): number[] {
  const data: number[] = []
  for (let i = 0; i < n; i += 2) {
    const u1 = Math.random()
    const u2 = Math.random()
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2)
    data.push(mean + z0 * stdDev)
    if (i + 1 < n) data.push(mean + z1 * stdDev)
  }
  return data
}

// Generate sample normal distribution
const normalData = generateNormalData(1000, 50, 15)

export default function HistogramChartDemo() {
  return (
    <div className="w-full max-w-3xl">
      <HistogramChart
        data={normalData}
        bins={40}
        showBorder
        xAxisLabel="Value"
        yAxisLabel="Frequency"
      />
    </div>
  )
}
