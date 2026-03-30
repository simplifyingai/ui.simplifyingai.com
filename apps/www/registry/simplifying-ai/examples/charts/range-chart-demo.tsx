"use client"

import { RangeChart } from "@/registry/simplifying-ai/ui/charts"

const temperatureData = [
  { category: "Jan", low: 5, high: 26, mid: 15 },
  { category: "Feb", low: 8, high: 37, mid: 22 },
  { category: "Mar", low: 12, high: 44, mid: 28 },
  { category: "Apr", low: 13, high: 36, mid: 24 },
  { category: "May", low: 7, high: 27, mid: 17 },
  { category: "Jun", low: 26, high: 33, mid: 29 },
]

export default function RangeChartDemo() {
  return (
    <RangeChart
      data={temperatureData}
      lowLabel="Min"
      highLabel="Max"
      midLabel="Avg"
      color="#3b82f6"
    />
  )
}
