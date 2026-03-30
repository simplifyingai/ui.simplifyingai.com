"use client"

import { RangeChart } from "@/registry/simplifying-ai/ui/charts"

const performanceData = [
  { category: "Response Time", low: 120, high: 280, mid: 180 },
  { category: "Throughput", low: 450, high: 720, mid: 580 },
  { category: "CPU Usage", low: 35, high: 85, mid: 55 },
  { category: "Memory", low: 2.1, high: 4.8, mid: 3.2 },
  { category: "Latency", low: 15, high: 65, mid: 32 },
]

export default function RangeChartHorizontal() {
  return (
    <RangeChart
      data={performanceData}
      variant="bars"
      orientation="horizontal"
      lowLabel="Min"
      highLabel="Max"
      midLabel="Avg"
      fillColor="#f59e0b"
      strokeColor="#d97706"
      midLineColor="#b45309"
    />
  )
}
