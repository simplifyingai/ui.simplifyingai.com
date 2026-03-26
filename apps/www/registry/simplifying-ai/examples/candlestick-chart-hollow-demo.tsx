"use client"

import { CandlestickChart } from "@/registry/simplifying-ai/ui/charts"

// Stock data for hollow candles demo
const chartData = [
  { date: "2024-03-01", open: 100, high: 108, low: 98, close: 105 },
  { date: "2024-03-04", open: 105, high: 112, low: 102, close: 98 },
  { date: "2024-03-05", open: 98, high: 102, low: 95, close: 100 },
  { date: "2024-03-06", open: 100, high: 115, low: 98, close: 112 },
  { date: "2024-03-07", open: 112, high: 118, low: 110, close: 108 },
  { date: "2024-03-08", open: 108, high: 115, low: 105, close: 113 },
  { date: "2024-03-11", open: 113, high: 120, low: 110, close: 118 },
  { date: "2024-03-12", open: 118, high: 125, low: 115, close: 110 },
  { date: "2024-03-13", open: 110, high: 115, low: 105, close: 112 },
  { date: "2024-03-14", open: 112, high: 128, low: 110, close: 125 },
  { date: "2024-03-15", open: 125, high: 132, low: 122, close: 118 },
  { date: "2024-03-18", open: 118, high: 125, low: 115, close: 122 },
  { date: "2024-03-19", open: 122, high: 135, low: 120, close: 132 },
  { date: "2024-03-20", open: 132, high: 140, low: 130, close: 128 },
  { date: "2024-03-21", open: 128, high: 135, low: 125, close: 133 },
  { date: "2024-03-22", open: 133, high: 142, low: 130, close: 138 },
]

export default function CandlestickChartHollowDemo() {
  return (
    <CandlestickChart
      data={chartData}
      showGrid
      hollowCandles
      aspectRatio={2.5}
    />
  )
}
