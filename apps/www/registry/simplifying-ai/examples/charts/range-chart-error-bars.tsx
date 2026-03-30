"use client"

import { RangeChart } from "@/registry/simplifying-ai/ui/charts"

const experimentData = [
  { category: "Control", low: 45, high: 55, mid: 50 },
  { category: "Treatment A", low: 58, high: 72, mid: 65 },
  { category: "Treatment B", low: 52, high: 68, mid: 60 },
  { category: "Treatment C", low: 70, high: 85, mid: 78 },
  { category: "Treatment D", low: 62, high: 75, mid: 68 },
]

export default function RangeChartErrorBars() {
  return (
    <RangeChart
      data={experimentData}
      variant="bars"
      showErrorBars={true}
      showMarkers={true}
      lowLabel="Lower CI"
      highLabel="Upper CI"
      midLabel="Mean"
      color="#8b5cf6"
      fillOpacity={0.4}
      valueFormatter={(v) => `${v}%`}
    />
  )
}
