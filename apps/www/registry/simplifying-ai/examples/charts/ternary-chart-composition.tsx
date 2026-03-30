"use client"

import { TernaryChart } from "@/registry/simplifying-ai/ui/charts/scientific/ternary-chart"

const alloyData = [
  { id: "Steel A", a: 70, b: 20, c: 10, label: "High Iron", group: "Steel" },
  { id: "Steel B", a: 65, b: 25, c: 10, label: "Balanced", group: "Steel" },
  { id: "Bronze A", a: 10, b: 88, c: 2, label: "High Copper", group: "Bronze" },
  { id: "Bronze B", a: 12, b: 80, c: 8, label: "Tin Bronze", group: "Bronze" },
  { id: "Brass A", a: 5, b: 70, c: 25, label: "Standard", group: "Brass" },
  { id: "Brass B", a: 8, b: 62, c: 30, label: "High Zinc", group: "Brass" },
]

export default function TernaryChartComposition() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <TernaryChart
        data={alloyData}
        labels={["Iron", "Copper", "Zinc"]}
        showGrid
        showLabels
        gridLines={4}
        pointRadius={8}
        colorScheme={["#3b82f6", "#f59e0b", "#8b5cf6"]}
      />
    </div>
  )
}
