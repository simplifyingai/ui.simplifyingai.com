"use client"

import { SlopeChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { category: "Revenue", values: [120, 145, 168, 195, 220] },
  { category: "Costs", values: [80, 95, 105, 115, 125] },
  { category: "Profit", values: [40, 50, 63, 80, 95] },
  { category: "Users", values: [50, 72, 95, 130, 175] },
]

export default function SlopeChartMulti() {
  return (
    <SlopeChart
      data={data}
      labels={["2020", "2021", "2022", "2023", "2024"]}
      valueFormatter={(v) => `$${v}M`}
    />
  )
}
