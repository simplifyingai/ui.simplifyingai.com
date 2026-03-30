"use client"

import { SplomChart } from "@/registry/simplifying-ai/ui/charts/statistical/splom-chart"

const metricsData = [
  { id: "Q1", values: { revenue: 120, expenses: 80, profit: 40, growth: 12 } },
  { id: "Q2", values: { revenue: 150, expenses: 90, profit: 60, growth: 25 } },
  { id: "Q3", values: { revenue: 140, expenses: 85, profit: 55, growth: -7 } },
  { id: "Q4", values: { revenue: 180, expenses: 100, profit: 80, growth: 28 } },
  { id: "Q5", values: { revenue: 160, expenses: 95, profit: 65, growth: -11 } },
  { id: "Q6", values: { revenue: 200, expenses: 110, profit: 90, growth: 25 } },
  {
    id: "Q7",
    values: { revenue: 175, expenses: 105, profit: 70, growth: -12 },
  },
  { id: "Q8", values: { revenue: 210, expenses: 120, profit: 90, growth: 20 } },
]

const dimensions = ["revenue", "expenses", "profit", "growth"]

export default function SplomChartCompact() {
  return (
    <SplomChart
      data={metricsData}
      dimensions={dimensions}
      variant="compact"
      showLabels
      color="#8b5cf6"
    />
  )
}
