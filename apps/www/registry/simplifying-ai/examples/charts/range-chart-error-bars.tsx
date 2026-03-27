"use client"

import { RangeChart } from "@/registry/simplifying-ai/ui/charts/basic/range-chart"

const experimentData = [
  { x: "Control", low: 42, high: 58, mid: 50, label: "Control Group" },
  { x: "Treatment A", low: 55, high: 75, mid: 65, label: "Treatment A" },
  { x: "Treatment B", low: 48, high: 68, mid: 58, label: "Treatment B" },
  { x: "Treatment C", low: 70, high: 90, mid: 80, label: "Treatment C" },
  { x: "Treatment D", low: 35, high: 55, mid: 45, label: "Treatment D" },
]

export default function RangeChartErrorBars() {
  return (
    <div className="w-full max-w-lg mx-auto">
      <RangeChart
        data={experimentData}
        variant="errorBars"
        xAxisLabel="Experiment Group"
        yAxisLabel="Response Value"
        strokeColor="#dc2626"
        midLineColor="#dc2626"
      />
    </div>
  )
}
