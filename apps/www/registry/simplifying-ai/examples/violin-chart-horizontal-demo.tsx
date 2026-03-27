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

// API response time distribution
const data = [
  { label: "GET /users", values: generateData(45, 20, 100, 1), color: "#1e40af" },
  { label: "POST /orders", values: generateData(120, 40, 100, 2), color: "#2563eb" },
  { label: "GET /products", values: generateData(35, 15, 100, 3), color: "#3b82f6" },
  { label: "PUT /cart", values: generateData(85, 25, 100, 4), color: "#60a5fa" },
]

export default function ViolinChartHorizontalDemo() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <ViolinChart
        data={data}
        width={480}
        height={350}
        orientation="horizontal"
        showBoxPlot
        showMedian
        xAxisLabel="Response Time (ms)"
        yAxisLabel="Endpoint"
      />
    </div>
  )
}
