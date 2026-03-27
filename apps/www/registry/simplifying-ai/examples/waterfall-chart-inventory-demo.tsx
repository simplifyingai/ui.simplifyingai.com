"use client"

import { WaterfallChart } from "@/registry/simplifying-ai/ui/charts"

// Inventory movement tracking
const data = [
  { label: "Opening", value: 5000, isTotal: true },
  { label: "Received", value: 2200 },
  { label: "Production", value: 1800 },
  { label: "Sales", value: -3500 },
  { label: "Returns", value: 150 },
  { label: "Damaged", value: -120 },
  { label: "Adjustments", value: -80 },
  { label: "Closing", value: 5450, isTotal: true },
]

export default function WaterfallChartInventoryDemo() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <WaterfallChart
        data={data}
        width={500}
        height={350}
        xAxisLabel="Movement Type"
        yAxisLabel="Units"
        positiveColor="#2563eb"
        negativeColor="#93c5fd"
        totalColor="#1e40af"
      />
    </div>
  )
}
