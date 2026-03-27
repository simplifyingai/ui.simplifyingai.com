"use client"

import { SplomChart } from "@/registry/simplifying-ai/ui/charts/statistical/splom-chart"

const metricsData = [
  { id: "Q1", values: { revenue: 120, expenses: 80, profit: 40 } },
  { id: "Q2", values: { revenue: 150, expenses: 90, profit: 60 } },
  { id: "Q3", values: { revenue: 140, expenses: 85, profit: 55 } },
  { id: "Q4", values: { revenue: 180, expenses: 100, profit: 80 } },
  { id: "Q5", values: { revenue: 160, expenses: 95, profit: 65 } },
  { id: "Q6", values: { revenue: 200, expenses: 110, profit: 90 } },
  { id: "Q7", values: { revenue: 175, expenses: 105, profit: 70 } },
  { id: "Q8", values: { revenue: 210, expenses: 120, profit: 90 } },
]

const dimensions = ["revenue", "expenses", "profit"]

export default function SplomChartCompact() {
  return (
    <div className="w-full max-w-md mx-auto">
      <SplomChart
        data={metricsData}
        dimensions={dimensions}
        cellSize={90}
        pointRadius={4}
        showHistograms
        colorScheme={["#7c3aed"]}
      />
    </div>
  )
}
