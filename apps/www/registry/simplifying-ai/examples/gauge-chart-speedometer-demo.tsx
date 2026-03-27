"use client"

import { GaugeChart } from "@/registry/simplifying-ai/ui/charts"

export default function GaugeChartSpeedometerDemo() {
  return (
    <GaugeChart
      value={68}
      min={0}
      max={100}
      variant="speedometer"
      color="#3b82f6"
      thickness={0.18}
      showTicks
      tickCount={5}
      animate
    />
  )
}
