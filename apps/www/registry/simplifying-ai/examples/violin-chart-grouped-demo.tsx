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

// Test scores across multiple subjects
const data = [
  { category: "Math", values: generateData(72, 14, 80, 1) },
  { category: "Science", values: generateData(68, 16, 80, 2) },
  { category: "English", values: generateData(75, 12, 80, 3) },
  { category: "History", values: generateData(70, 15, 80, 4) },
  { category: "Art", values: generateData(80, 10, 80, 5) },
]

export default function ViolinChartGroupedDemo() {
  return <ViolinChart data={data} showBoxPlot showMedian />
}
