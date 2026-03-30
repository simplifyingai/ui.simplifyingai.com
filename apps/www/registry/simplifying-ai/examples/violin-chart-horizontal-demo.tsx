"use client"

import { ViolinChart } from "@/registry/simplifying-ai/ui/charts"

// Generate sample data
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
  { category: "GET /users", values: generateData(45, 20, 100, 1) },
  { category: "POST /orders", values: generateData(120, 40, 100, 2) },
  { category: "GET /products", values: generateData(35, 15, 100, 3) },
  { category: "PUT /cart", values: generateData(85, 25, 100, 4) },
]

export default function ViolinChartHorizontalDemo() {
  return (
    <ViolinChart
      data={data}
      showBoxPlot
      showMedian
      color="#06b6d4"
      valueFormatter={(v) => `${v.toFixed(0)}ms`}
    />
  )
}
