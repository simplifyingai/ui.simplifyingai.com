"use client"

import { GaugeChart } from "@/registry/simplifying-ai/ui/charts"

export default function GaugeChartDashboardDemo() {
  return (
    <GaugeChart
      value={82}
      min={0}
      max={100}
      variant="dashboard"
      label="Completion Rate"
      color="#2563eb"
      thickness={0.15}
      animate
    />
  )
}
