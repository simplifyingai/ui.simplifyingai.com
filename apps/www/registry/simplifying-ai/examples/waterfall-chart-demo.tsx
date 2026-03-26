"use client"

import { WaterfallChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { label: "Starting", value: 1000, type: "total" as const },
  { label: "Product Sales", value: 500, type: "positive" as const },
  { label: "Service Revenue", value: 300, type: "positive" as const },
  { label: "Operating Costs", value: -400, type: "negative" as const },
  { label: "Marketing", value: -200, type: "negative" as const },
  { label: "Tax", value: -150, type: "negative" as const },
  { label: "Net Income", value: 1050, type: "total" as const },
]

export default function WaterfallChartDemo() {
  return (
    <div className="w-full max-w-3xl">
      <WaterfallChart
        data={data}
        xAxisLabel="Category"
        yAxisLabel="Amount ($)"
      />
    </div>
  )
}
