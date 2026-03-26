"use client"

import { GaugeChart } from "@/registry/simplifying-ai/ui/charts"

export default function GaugeChartSegmentedDemo() {
  return (
    <GaugeChart
      value={45}
      min={0}
      max={100}
      variant="segmented"
      label="Risk Level"
      thickness={0.15}
      segments={[
        { value: 0, color: "#22c55e", label: "Low" },
        { value: 33, color: "#f59e0b", label: "Medium" },
        { value: 66, color: "#ef4444", label: "High" },
      ]}
      animate
    />
  )
}
