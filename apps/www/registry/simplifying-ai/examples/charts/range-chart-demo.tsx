"use client"

import { RangeChart } from "@/registry/simplifying-ai/ui/charts"

const temperatureData = [
  { category: "Jan", low: -5, high: 8, mid: 2 },
  { category: "Feb", low: -3, high: 10, mid: 4 },
  { category: "Mar", low: 2, high: 15, mid: 8 },
  { category: "Apr", low: 6, high: 20, mid: 13 },
  { category: "May", low: 10, high: 24, mid: 17 },
  { category: "Jun", low: 14, high: 28, mid: 21 },
  { category: "Jul", low: 16, high: 32, mid: 24 },
  { category: "Aug", low: 15, high: 31, mid: 23 },
  { category: "Sep", low: 12, high: 26, mid: 19 },
  { category: "Oct", low: 7, high: 18, mid: 12 },
  { category: "Nov", low: 2, high: 12, mid: 7 },
  { category: "Dec", low: -2, high: 8, mid: 3 },
]

export default function RangeChartDemo() {
  return (
    <RangeChart
      data={temperatureData}
      lowLabel="Min"
      highLabel="Max"
      midLabel="Avg"
      valueFormatter={(v) => `${v}°C`}
    />
  )
}
