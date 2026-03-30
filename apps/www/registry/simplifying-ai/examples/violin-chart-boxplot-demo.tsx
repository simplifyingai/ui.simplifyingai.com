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

// Box plot only variant - no violin shape
const data = [
  { category: "Q1", values: generateData(82, 8, 50, 1) },
  { category: "Q2", values: generateData(78, 12, 50, 2) },
  { category: "Q3", values: generateData(85, 10, 50, 3) },
  { category: "Q4", values: generateData(90, 6, 50, 4) },
]

export default function ViolinChartBoxplotDemo() {
  return (
    <ViolinChart data={data} variant="boxplot" showMedian color="#8b5cf6" />
  )
}
