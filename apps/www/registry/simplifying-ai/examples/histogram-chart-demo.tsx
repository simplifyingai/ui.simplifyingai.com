"use client"

import { HistogramChart } from "@/registry/simplifying-ai/ui/charts"

// Generate sample data
const values = Array.from({ length: 100 }, () => Math.random() * 100)

const config = {
  frequency: { label: "Frequency", color: "var(--chart-1)" },
}

export default function HistogramChartDemo() {
  return (
    <div className="w-full max-w-3xl">
      <HistogramChart
        data={values}
        config={config}
        bins={10}
        xAxisLabel="Value"
        yAxisLabel="Frequency"
      />
    </div>
  )
}
