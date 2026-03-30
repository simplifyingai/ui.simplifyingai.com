"use client"

import { SlopeChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { category: "Marketing", start: 45, end: 72 },
  { category: "Sales", start: 68, end: 55 },
  { category: "Engineering", start: 32, end: 58 },
  { category: "Support", start: 55, end: 78 },
  { category: "Operations", start: 82, end: 65 },
]

export default function SlopeChartDemo() {
  return (
    <SlopeChart
      data={data}
      labels={["Q1 2024", "Q4 2024"]}
    />
  )
}
