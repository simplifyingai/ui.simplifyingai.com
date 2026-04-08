"use client"

import { DotPlotChart } from "@/registry/simplifying-ai/ui/charts"

// Static sample data resembling a distribution
const data = [
  34, 38, 41, 42, 43, 44, 44, 45, 45, 46, 46, 46, 47, 47, 47, 47, 48, 48, 48,
  48, 49, 49, 49, 49, 49, 50, 50, 50, 50, 50, 51, 51, 51, 51, 51, 51, 52, 52,
  52, 52, 53, 53, 53, 53, 53, 54, 54, 54, 54, 55, 55, 55, 55, 55, 56, 56, 56,
  56, 57, 57, 57, 57, 58, 58, 58, 59, 59, 59, 60, 60, 61, 61, 62, 62, 63, 64,
  65, 66, 68, 70, 71, 72, 73, 75, 77, 79,
]

export default function DotPlotChartDemo() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <DotPlotChart
        data={data}
        dotSize={8}
        binCount={25}
        xAxisLabel="Score Distribution"
      />
    </div>
  )
}
