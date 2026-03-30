"use client"

import { SlopeChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { category: "Product A", start: 1200, end: 1850 },
  { category: "Product B", start: 980, end: 1100 },
  { category: "Product C", start: 1500, end: 1350 },
  { category: "Product D", start: 750, end: 1200 },
]

export default function SlopeChartParallel() {
  return (
    <SlopeChart
      data={data}
      variant="parallel"
      labels={["Before Launch", "After Launch"]}
      valueFormatter={(v) => `${v} units`}
    />
  )
}
