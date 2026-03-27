"use client"

import { ViolinChart } from "@/registry/simplifying-ai/ui/charts"

// Generate sample data with normal-ish distribution
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

// Performance scores by department
const data = [
  { label: "Engineering", values: generateData(78, 12, 80, 1), color: "#1e40af" },
  { label: "Sales", values: generateData(72, 15, 80, 2), color: "#2563eb" },
  { label: "Marketing", values: generateData(75, 10, 80, 3), color: "#3b82f6" },
  { label: "Support", values: generateData(70, 18, 80, 4), color: "#60a5fa" },
  { label: "Finance", values: generateData(82, 8, 80, 5), color: "#93c5fd" },
]

export default function ViolinChartDemo() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <ViolinChart
        data={data}
        width={480}
        height={380}
        showBoxPlot
        showMedian
        xAxisLabel="Department"
        yAxisLabel="Performance Score"
      />
    </div>
  )
}
