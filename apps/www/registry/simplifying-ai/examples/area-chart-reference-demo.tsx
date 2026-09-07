"use client"

import { AreaChart } from "@/registry/simplifying-ai/ui/charts"

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]

// Deterministic, so the demo renders identically on server and client.
const chartData = Array.from({ length: 42 }, (_, i) => ({
  label: months[Math.floor(i / 6)],
  value:
    8200 +
    Math.round(
      1400 * Math.sin(i / 1.7) + 900 * Math.cos(i / 3.1) + 420 * Math.sin(i)
    ),
}))

export default function AreaChartReferenceDemo() {
  return (
    <AreaChart
      data={chartData}
      showGrid={false}
      aspectRatio={2.6}
      xAxisInterval={5}
      valueFormatter={(v) => `$${v.toLocaleString()}`}
      referenceLine={{ value: "avg", label: "Average" }}
    />
  )
}
