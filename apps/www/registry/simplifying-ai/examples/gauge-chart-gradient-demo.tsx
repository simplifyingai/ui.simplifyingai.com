"use client"

import { GaugeChart } from "@/registry/simplifying-ai/ui/charts"

export default function GaugeChartGradientDemo() {
  return (
    <GaugeChart
      value={65}
      min={0}
      max={100}
      variant="gradient"
      label="Progress"
      color="#3b82f6"
      colorSecondary="#ec4899"
      thickness={0.12}
      animate
    />
  )
}
