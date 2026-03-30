"use client"

import { RangeChart } from "@/registry/simplifying-ai/ui/charts"

const performanceData = [
  { category: "Engineering", low: 72, high: 95, mid: 85 },
  { category: "Design", low: 68, high: 92, mid: 80 },
  { category: "Marketing", low: 75, high: 98, mid: 88 },
  { category: "Sales", low: 65, high: 90, mid: 78 },
  { category: "Support", low: 70, high: 88, mid: 82 },
]

export default function RangeChartHorizontal() {
  return (
    <RangeChart
      data={performanceData}
      variant="horizontal"
      showMarkers={true}
      lowLabel="Min"
      highLabel="Max"
      midLabel="Avg"
      color="#10b981"
      fillOpacity={0.4}
      valueFormatter={(v) => `${v}%`}
    />
  )
}
