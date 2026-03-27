"use client"

import { GaugeChart } from "@/registry/simplifying-ai/ui/charts"

export default function GaugeChartDemo() {
  return (
    <GaugeChart
      value={72}
      min={0}
      max={100}
      label="Performance Score"
      color="#2563eb"
      thickness={0.12}
      animate
    />
  )
}
