"use client"

import { HistogramChart } from "@/registry/simplifying-ai/ui/charts"

// Generate normal distribution data
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

// Three overlapping distributions
const dataset1 = generateNormalData(600, 30, 10)
const dataset2 = generateNormalData(600, 50, 12)
const dataset3 = generateNormalData(600, 70, 11)

export default function HistogramChartSteppedDemo() {
  return (
    <div className="w-full max-w-3xl">
      <HistogramChart
        data={[
          { data: dataset1, label: "Group A", color: "#3b82f6" },
          { data: dataset2, label: "Group B", color: "#8b5cf6" },
          { data: dataset3, label: "Group C", color: "#06b6d4" },
        ]}
        variant="stepped"
        bins={40}
        fillOpacity={0.35}
        xAxisLabel="Value"
        yAxisLabel="Frequency"
      />
    </div>
  )
}
