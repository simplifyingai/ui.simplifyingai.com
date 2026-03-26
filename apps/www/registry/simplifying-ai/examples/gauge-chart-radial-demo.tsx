"use client"

import { GaugeChart } from "@/registry/simplifying-ai/ui/charts"

export default function GaugeChartRadialDemo() {
  return (
    <GaugeChart
      value={78}
      min={0}
      max={100}
      variant="radial"
      label="%"
      color="#8b5cf6"
      thickness={0.1}
      width={200}
      height={200}
      animate
    />
  )
}
