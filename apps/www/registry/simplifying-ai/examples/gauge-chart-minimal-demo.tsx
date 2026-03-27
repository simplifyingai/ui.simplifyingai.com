"use client"

import { GaugeChart } from "@/registry/simplifying-ai/ui/charts"

export default function GaugeChartMinimalDemo() {
  return (
    <GaugeChart
      value={85}
      min={0}
      max={100}
      variant="minimal"
      label="Completion"
      color="#60a5fa"
      thickness={0.08}
      animate
    />
  )
}
