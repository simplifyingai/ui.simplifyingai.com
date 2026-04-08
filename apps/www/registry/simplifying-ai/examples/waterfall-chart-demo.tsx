"use client"

import { WaterfallChart } from "@/registry/simplifying-ai/ui/charts"

// P&L Statement breakdown
const data = [
  { label: "Revenue", value: 5200, isTotal: true },
  { label: "Product Sales", value: 1800 },
  { label: "Services", value: 1200 },
  { label: "Licensing", value: 650 },
  { label: "Gross Profit", value: 8850, isSubtotal: true },
  { label: "Salaries", value: -2400 },
  { label: "Marketing", value: -850 },
  { label: "Operations", value: -1200 },
  { label: "R&D", value: -950 },
  { label: "Operating Income", value: 3450, isSubtotal: true },
  { label: "Interest", value: -180 },
  { label: "Taxes", value: -720 },
  { label: "Net Income", value: 2550, isTotal: true },
]

export default function WaterfallChartDemo() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <WaterfallChart
        data={data}
        width={560}
        height={380}
        xAxisLabel="Category"
        yAxisLabel="Amount ($K)"
      />
    </div>
  )
}
