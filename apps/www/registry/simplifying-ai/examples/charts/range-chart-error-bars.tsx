"use client"

import { RangeChart } from "@/registry/simplifying-ai/ui/charts"

const experimentData = [
  { category: "Control", low: 42, high: 58, mid: 50 },
  { category: "Group A", low: 55, high: 75, mid: 65 },
  { category: "Group B", low: 48, high: 68, mid: 58 },
  { category: "Group C", low: 70, high: 90, mid: 80 },
  { category: "Group D", low: 35, high: 55, mid: 45 },
]

export default function RangeChartErrorBars() {
  return (
    <RangeChart
      data={experimentData}
      variant="bars"
      lowLabel="Lower CI"
      highLabel="Upper CI"
      midLabel="Mean"
      fillColor="#dc2626"
      strokeColor="#b91c1c"
      midLineColor="#7f1d1d"
    />
  )
}
