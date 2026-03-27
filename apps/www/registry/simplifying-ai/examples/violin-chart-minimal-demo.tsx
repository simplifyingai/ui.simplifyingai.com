"use client"

import { ViolinChart } from "@/registry/simplifying-ai/ui/charts"

// Generate sample data with seeded random
const generateData = (mean: number, std: number, n: number, seed: number) => {
  const values: number[] = []
  let s = seed
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280
    const u1 = s / 233280
    s = (s * 9301 + 49297) % 233280
    const u2 = s / 233280
    const z = Math.sqrt(-2 * Math.log(u1 || 0.001)) * Math.cos(2 * Math.PI * u2)
    values.push(mean + std * z)
  }
  return values
}

// Simple age distribution
const data = [
  { label: "Group A", values: generateData(35, 10, 60, 1), color: "#2563eb" },
  { label: "Group B", values: generateData(42, 12, 60, 2), color: "#3b82f6" },
  { label: "Group C", values: generateData(38, 8, 60, 3), color: "#60a5fa" },
]

export default function ViolinChartMinimalDemo() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <ViolinChart
        data={data}
        width={340}
        height={300}
        showBoxPlot={false}
        showMedian
        xAxisLabel="Group"
        yAxisLabel="Age"
      />
    </div>
  )
}
