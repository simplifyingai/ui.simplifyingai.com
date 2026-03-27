"use client"

import { WaterfallChart } from "@/registry/simplifying-ai/ui/charts"

// Simple profit calculation
const data = [
  { label: "Revenue", value: 500, isTotal: true },
  { label: "COGS", value: -180 },
  { label: "Expenses", value: -120 },
  { label: "Tax", value: -50 },
  { label: "Profit", value: 150, isTotal: true },
]

export default function WaterfallChartMinimalDemo() {
  return (
    <div className="mx-auto w-full max-w-md">
      <WaterfallChart
        data={data}
        width={420}
        height={320}
        xAxisLabel="Category"
        yAxisLabel="Amount ($K)"
        positiveColor="#3b82f6"
        negativeColor="#60a5fa"
        totalColor="#1e40af"
      />
    </div>
  )
}
