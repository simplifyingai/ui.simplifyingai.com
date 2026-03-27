"use client"

import { SlopeChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { category: "Product A", start: 45, end: 72 },
  { category: "Product B", start: 68, end: 55 },
  { category: "Product C", start: 32, end: 58 },
  { category: "Product D", start: 55, end: 78 },
  { category: "Product E", start: 82, end: 65 },
]

export default function SlopeChartDemo() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <SlopeChart
        data={data}
        startLabel="Q1 2024"
        endLabel="Q4 2024"
        showValues
      />
    </div>
  )
}
