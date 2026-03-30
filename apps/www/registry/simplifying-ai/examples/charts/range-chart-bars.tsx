"use client"

import { RangeChart } from "@/registry/simplifying-ai/ui/charts"

const stockData = [
  { category: "AAPL", low: 145, high: 182, mid: 165 },
  { category: "GOOGL", low: 120, high: 145, mid: 133 },
  { category: "MSFT", low: 310, high: 385, mid: 350 },
  { category: "AMZN", low: 125, high: 175, mid: 152 },
  { category: "META", low: 280, high: 350, mid: 315 },
]

export default function RangeChartBars() {
  return (
    <RangeChart
      data={stockData}
      variant="bars"
      lowLabel="52w Low"
      highLabel="52w High"
      midLabel="Current"
      fillColor="#059669"
      strokeColor="#047857"
      midLineColor="#065f46"
      valueFormatter={(v) => `$${v}`}
    />
  )
}
