"use client"

import { RangeChart } from "@/registry/simplifying-ai/ui/charts"

const salesData = [
  { category: "Australia", low: 2500, high: 4200, mid: 3500 },
  { category: "Canada", low: 4000, high: 8000, mid: 6000 },
  { category: "Central", low: 2800, high: 4200, mid: 3500 },
  { category: "France", low: 2500, high: 4000, mid: 3200 },
  { category: "Germany", low: 900, high: 2800, mid: 1800 },
  { category: "Northeast", low: 3200, high: 5500, mid: 4300 },
]

export default function RangeChartBars() {
  return (
    <RangeChart
      data={salesData}
      variant="bars"
      lowLabel="Min"
      highLabel="Max"
      midLabel="Avg"
      color="#4472c4"
      fillOpacity={0.5}
      showMarkers={true}
    />
  )
}
