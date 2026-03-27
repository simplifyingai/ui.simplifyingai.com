"use client"

import { RangeChart } from "@/registry/simplifying-ai/ui/charts/basic/range-chart"

const stockData = [
  { x: "AAPL", low: 145, high: 182, mid: 165, label: "Apple" },
  { x: "GOOGL", low: 120, high: 145, mid: 133, label: "Google" },
  { x: "MSFT", low: 310, high: 385, mid: 350, label: "Microsoft" },
  { x: "AMZN", low: 125, high: 175, mid: 152, label: "Amazon" },
  { x: "META", low: 280, high: 350, mid: 315, label: "Meta" },
]

export default function RangeChartBars() {
  return (
    <div className="w-full max-w-lg mx-auto">
      <RangeChart
        data={stockData}
        variant="bars"
        showMidLine
        xAxisLabel="Stock"
        yAxisLabel="52-Week Range ($)"
        fillColor="#059669"
        strokeColor="#047857"
        midLineColor="#065f46"
        valueFormatter={(v) => `$${v}`}
      />
    </div>
  )
}
