"use client"

import { RangeChart } from "@/registry/simplifying-ai/ui/charts"

const salaryData = [
  { category: "Junior", low: 45, high: 65, mid: 55 },
  { category: "Mid-Level", low: 65, high: 95, mid: 80 },
  { category: "Senior", low: 95, high: 140, mid: 115 },
  { category: "Lead", low: 120, high: 170, mid: 145 },
  { category: "Principal", low: 150, high: 220, mid: 185 },
]

export default function RangeChartFloating() {
  return (
    <RangeChart
      data={salaryData}
      lowLabel="Min Salary"
      highLabel="Max Salary"
      midLabel="Median"
      color="#8b5cf6"
      fillOpacity={0.4}
      valueFormatter={(v) => `$${v}K`}
    />
  )
}
