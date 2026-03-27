"use client"

import { DumbbellChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { category: "Marketing", start: 45, end: 72, startLabel: "2023", endLabel: "2024" },
  { category: "Sales", start: 68, end: 85, startLabel: "2023", endLabel: "2024" },
  { category: "Engineering", start: 82, end: 78, startLabel: "2023", endLabel: "2024" },
  { category: "Support", start: 55, end: 88, startLabel: "2023", endLabel: "2024" },
  { category: "HR", start: 40, end: 65, startLabel: "2023", endLabel: "2024" },
  { category: "Finance", start: 72, end: 80, startLabel: "2023", endLabel: "2024" },
]

export default function DumbbellChartDemo() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <DumbbellChart
        data={data}
        orientation="horizontal"
        dotSize={10}
        showValues
      />
    </div>
  )
}
