"use client"

import { CandlestickChart } from "@/registry/simplifying-ai/ui/charts"

// Stock price data
const chartData = [
  { date: "2024-03-01", open: 35, high: 45, low: 32, close: 44 },
  { date: "2024-03-04", open: 44, high: 42, low: 35, close: 38 },
  { date: "2024-03-06", open: 38, high: 40, low: 25, close: 28 },
  { date: "2024-03-08", open: 28, high: 32, low: 18, close: 20 },
  { date: "2024-03-12", open: 20, high: 45, low: 16, close: 41 },
  { date: "2024-03-15", open: 41, high: 68, low: 38, close: 65 },
  { date: "2024-03-19", open: 65, high: 66, low: 38, close: 40 },
  { date: "2024-03-22", open: 40, high: 42, low: 22, close: 25 },
  { date: "2024-03-26", open: 25, high: 28, low: 8, close: 10 },
  { date: "2024-03-29", open: 10, high: 35, low: 5, close: 32 },
  { date: "2024-04-03", open: 32, high: 50, low: 30, close: 48 },
  { date: "2024-04-08", open: 48, high: 62, low: 44, close: 58 },
  { date: "2024-04-11", open: 58, high: 60, low: 35, close: 38 },
  { date: "2024-04-16", open: 38, high: 40, low: 28, close: 33 },
  { date: "2024-04-22", open: 33, high: 35, low: 12, close: 20 },
  { date: "2024-04-26", open: 20, high: 35, low: 18, close: 32 },
  { date: "2024-05-01", open: 32, high: 58, low: 28, close: 55 },
  { date: "2024-05-03", open: 55, high: 85, low: 48, close: 78 },
  { date: "2024-05-07", open: 78, high: 82, low: 70, close: 75 },
]

export default function CandlestickChartDemo() {
  return (
    <CandlestickChart
      data={chartData}
      showGrid
      aspectRatio={2}
    />
  )
}
