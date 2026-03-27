"use client"

import { WaterfallChart } from "@/registry/simplifying-ai/ui/charts"

// Budget variance analysis
const data = [
  { label: "Budget", value: 1000, isTotal: true },
  { label: "Volume", value: 150 },
  { label: "Price", value: 80 },
  { label: "Mix", value: -45 },
  { label: "Cost Savings", value: 120 },
  { label: "Inflation", value: -85 },
  { label: "FX Impact", value: -35 },
  { label: "Other", value: 25 },
  { label: "Actual", value: 1210, isTotal: true },
]

export default function WaterfallChartBudgetDemo() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <WaterfallChart
        data={data}
        width={500}
        height={350}
        xAxisLabel="Variance Driver"
        yAxisLabel="Amount ($K)"
        positiveColor="#3b82f6"
        negativeColor="#60a5fa"
        totalColor="#1e40af"
      />
    </div>
  )
}
