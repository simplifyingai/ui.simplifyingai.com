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

const data = [
  { category: "Engineering", values: generateData(78, 12, 80, 1) },
  { category: "Sales", values: generateData(72, 15, 80, 2) },
  { category: "Marketing", values: generateData(75, 10, 80, 3) },
  { category: "Support", values: generateData(70, 18, 80, 4) },
]

export default function ViolinChartDemo() {
  return <ViolinChart data={data} showBoxPlot showMedian />
}
