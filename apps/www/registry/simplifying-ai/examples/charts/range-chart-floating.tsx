"use client"

import { RangeChart } from "@/registry/simplifying-ai/ui/charts"

const salaryData = [
  { category: "Junior", low: 45000, high: 65000, mid: 55000 },
  { category: "Mid-Level", low: 65000, high: 95000, mid: 80000 },
  { category: "Senior", low: 95000, high: 140000, mid: 115000 },
  { category: "Lead", low: 120000, high: 170000, mid: 145000 },
  { category: "Principal", low: 150000, high: 220000, mid: 185000 },
]

export default function RangeChartFloating() {
  return (
    <RangeChart
      data={salaryData}
      variant="floating"
      lowLabel="Min Salary"
      highLabel="Max Salary"
      midLabel="Median"
      fillColor="#8b5cf6"
      midLineColor="#6d28d9"
      valueFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
    />
  )
}
