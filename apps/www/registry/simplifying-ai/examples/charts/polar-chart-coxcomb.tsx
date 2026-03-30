"use client"

import { PolarChart } from "@/registry/simplifying-ai/ui/charts/statistical/polar-chart"

const monthlyData = [
  { category: "Jan", value: 120 },
  { category: "Feb", value: 98 },
  { category: "Mar", value: 145 },
  { category: "Apr", value: 178 },
  { category: "May", value: 210 },
  { category: "Jun", value: 250 },
  { category: "Jul", value: 280 },
  { category: "Aug", value: 265 },
  { category: "Sep", value: 198 },
  { category: "Oct", value: 156 },
  { category: "Nov", value: 132 },
  { category: "Dec", value: 145 },
]

export default function PolarChartCoxcomb() {
  return (
    <div className="mx-auto w-full max-w-md">
      <PolarChart
        data={monthlyData}
        variant="coxcomb"
        showLabels
        showValues={false}
        colorScheme={[
          "#059669",
          "#10b981",
          "#34d399",
          "#6ee7b7",
          "#a7f3d0",
          "#d1fae5",
        ]}
      />
    </div>
  )
}
