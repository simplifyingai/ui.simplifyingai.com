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

// Simple before/after comparison
const data = [
  { category: "Before", values: generateData(45, 15, 100, 10) },
  { category: "After", values: generateData(68, 12, 100, 20) },
]

export default function ViolinChartComparisonDemo() {
  return <ViolinChart data={data} showBoxPlot showMedian color="#22c55e" />
}
