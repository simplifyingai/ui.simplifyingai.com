"use client"

import { CandlestickChart } from "@/registry/simplifying-ai/ui/charts"

// Stock price data for March-April
const chartData = [
  { date: "2024-03-01", open: 35, high: 45, low: 32, close: 44 },
  { date: "2024-03-04", open: 44, high: 42, low: 35, close: 38 },
  { date: "2024-03-05", open: 38, high: 40, low: 32, close: 37 },
  { date: "2024-03-06", open: 37, high: 25, low: 18, close: 20 },
  { date: "2024-03-07", open: 20, high: 22, low: 8, close: 10 },
  { date: "2024-03-08", open: 10, high: 22, low: 8, close: 20 },
  { date: "2024-03-11", open: 20, high: 22, low: 15, close: 18 },
  { date: "2024-03-12", open: 18, high: 45, low: 16, close: 41 },
  { date: "2024-03-13", open: 41, high: 56, low: 38, close: 54 },
  { date: "2024-03-14", open: 54, high: 42, low: 38, close: 40 },
  { date: "2024-03-15", open: 40, high: 68, low: 38, close: 65 },
  { date: "2024-03-18", open: 65, high: 68, low: 55, close: 66 },
  { date: "2024-03-19", open: 66, high: 45, low: 38, close: 40 },
  { date: "2024-03-20", open: 40, high: 42, low: 28, close: 37 },
  { date: "2024-03-21", open: 37, high: 35, low: 25, close: 30 },
  { date: "2024-03-22", open: 30, high: 32, low: 22, close: 25 },
  { date: "2024-03-25", open: 25, high: 28, low: 18, close: 22 },
  { date: "2024-03-26", open: 22, high: 25, low: 8, close: 10 },
  { date: "2024-03-27", open: 10, high: 22, low: 5, close: 17 },
  { date: "2024-03-28", open: 17, high: 25, low: 12, close: 23 },
  { date: "2024-03-29", open: 23, high: 35, low: 20, close: 32 },
  { date: "2024-04-01", open: 32, high: 48, low: 30, close: 46 },
  { date: "2024-04-02", open: 46, high: 42, low: 38, close: 40 },
  { date: "2024-04-03", open: 40, high: 50, low: 32, close: 48 },
  { date: "2024-04-04", open: 48, high: 50, low: 42, close: 46 },
  { date: "2024-04-05", open: 46, high: 60, low: 44, close: 58 },
  { date: "2024-04-08", open: 58, high: 62, low: 55, close: 60 },
  { date: "2024-04-09", open: 60, high: 50, low: 45, close: 47 },
  { date: "2024-04-10", open: 47, high: 45, low: 38, close: 40 },
  { date: "2024-04-11", open: 40, high: 42, low: 35, close: 38 },
  { date: "2024-04-12", open: 38, high: 40, low: 32, close: 35 },
  { date: "2024-04-15", open: 35, high: 38, low: 30, close: 34 },
  { date: "2024-04-16", open: 34, high: 38, low: 28, close: 33 },
  { date: "2024-04-17", open: 33, high: 35, low: 28, close: 30 },
  { date: "2024-04-18", open: 30, high: 35, low: 25, close: 28 },
  { date: "2024-04-19", open: 28, high: 25, low: 15, close: 18 },
  { date: "2024-04-22", open: 18, high: 22, low: 12, close: 20 },
  { date: "2024-04-23", open: 20, high: 15, low: 5, close: 8 },
  { date: "2024-04-24", open: 8, high: 18, low: 5, close: 15 },
  { date: "2024-04-25", open: 15, high: 32, low: 12, close: 28 },
  { date: "2024-04-26", open: 28, high: 30, low: 20, close: 22 },
  { date: "2024-04-29", open: 22, high: 35, low: 20, close: 32 },
  { date: "2024-04-30", open: 32, high: 58, low: 28, close: 55 },
  { date: "2024-05-01", open: 55, high: 58, low: 48, close: 51 },
  { date: "2024-05-02", open: 51, high: 75, low: 48, close: 72 },
  { date: "2024-05-03", open: 72, high: 85, low: 70, close: 83 },
  { date: "2024-05-06", open: 83, high: 78, low: 70, close: 73 },
  { date: "2024-05-07", open: 73, high: 80, low: 72, close: 75 },
]

export default function CandlestickChartDemo() {
  return <CandlestickChart data={chartData} showGrid aspectRatio={2.5} />
}
