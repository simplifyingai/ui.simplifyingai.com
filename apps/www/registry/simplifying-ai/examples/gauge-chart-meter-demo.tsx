"use client"

import { GaugeChart } from "@/registry/simplifying-ai/ui/charts"

export default function GaugeChartMeterDemo() {
  return (
    <GaugeChart
      value={58}
      min={0}
      max={100}
      variant="meter"
      label="Efficiency"
      color="#3b82f6"
      thickness={0.1}
      showTicks
      tickCount={5}
      animate
    />
  )
}
