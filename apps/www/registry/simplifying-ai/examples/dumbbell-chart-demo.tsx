"use client"

import { DumbbellChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { category: "Marketing", start: 45, end: 72 },
  { category: "Sales", start: 68, end: 85 },
  { category: "Engineering", start: 82, end: 78 },
  { category: "Support", start: 55, end: 88 },
  { category: "HR", start: 40, end: 65 },
  { category: "Finance", start: 72, end: 80 },
]

export default function DumbbellChartDemo() {
  return (
    <DumbbellChart
      data={data}
      startLabel="2023"
      endLabel="2024"
    />
  )
}
