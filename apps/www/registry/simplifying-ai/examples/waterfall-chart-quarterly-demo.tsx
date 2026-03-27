"use client"

import { WaterfallChart } from "@/registry/simplifying-ai/ui/charts"

// Quarterly revenue changes
const data = [
  { label: "Q1 Start", value: 2400, isTotal: true },
  { label: "New Sales", value: 850 },
  { label: "Renewals", value: 420 },
  { label: "Churn", value: -280 },
  { label: "Q1 End", value: 3390, isSubtotal: true },
  { label: "New Sales", value: 720 },
  { label: "Renewals", value: 380 },
  { label: "Churn", value: -190 },
  { label: "Q2 End", value: 4300, isTotal: true },
]

export default function WaterfallChartQuarterlyDemo() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <WaterfallChart
        data={data}
        width={500}
        height={350}
        xAxisLabel="Period"
        yAxisLabel="ARR ($K)"
        positiveColor="#2563eb"
        negativeColor="#93c5fd"
        totalColor="#1e40af"
      />
    </div>
  )
}
