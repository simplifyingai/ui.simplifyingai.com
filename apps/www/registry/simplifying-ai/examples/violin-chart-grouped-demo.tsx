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

// Test scores by subject
const data = [
  { label: "Math", values: generateData(72, 14, 120, 1), color: "#1e40af" },
  { label: "Science", values: generateData(68, 16, 120, 2), color: "#2563eb" },
  { label: "English", values: generateData(75, 12, 120, 3), color: "#3b82f6" },
  { label: "History", values: generateData(70, 15, 120, 4), color: "#60a5fa" },
  { label: "Art", values: generateData(80, 10, 120, 5), color: "#93c5fd" },
  { label: "Music", values: generateData(78, 11, 120, 6), color: "#bfdbfe" },
]

export default function ViolinChartGroupedDemo() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <ViolinChart
        data={data}
        width={560}
        height={380}
        showBoxPlot
        showMedian
        xAxisLabel="Subject"
        yAxisLabel="Test Score"
      />
    </div>
  )
}
