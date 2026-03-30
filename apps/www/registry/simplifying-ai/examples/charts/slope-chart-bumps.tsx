"use client"

import { SlopeChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { category: "Apple", values: [85, 92, 88, 95] },
  { category: "Google", values: [92, 85, 90, 88] },
  { category: "Microsoft", values: [78, 82, 85, 92] },
  { category: "Amazon", values: [88, 78, 82, 80] },
  { category: "Meta", values: [72, 75, 78, 75] },
]

export default function SlopeChartBumps() {
  return (
    <SlopeChart
      data={data}
      variant="bumps"
      labels={["Q1", "Q2", "Q3", "Q4"]}
      showRankChange
    />
  )
}
