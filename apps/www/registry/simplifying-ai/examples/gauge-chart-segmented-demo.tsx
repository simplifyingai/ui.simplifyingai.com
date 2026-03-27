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
        { value: 0, color: "#bfdbfe", label: "Low" },
        { value: 33, color: "#60a5fa", label: "Medium" },
        { value: 66, color: "#1e40af", label: "High" },
      ]}
      animate
    />
  )
}
