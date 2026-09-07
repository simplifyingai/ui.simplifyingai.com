"use client"

import { GaugeChart } from "@/registry/simplifying-ai/ui/charts"

export default function GaugeChartTicksDemo() {
  return (
    <GaugeChart
      variant="ticks"
      value={19500}
      max={26000}
      units="spent"
      valueFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
    />
  )
}
