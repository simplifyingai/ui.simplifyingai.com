"use client"

import { PolarChart } from "@/registry/simplifying-ai/ui/charts/statistical/polar-chart"

const skillsData = [
  { category: "Frontend", value: 85 },
  { category: "Backend", value: 72 },
  { category: "Database", value: 68 },
  { category: "DevOps", value: 55 },
  { category: "Testing", value: 78 },
  { category: "Design", value: 62 },
]

export default function PolarChartDonut() {
  return (
    <div className="w-full max-w-md mx-auto">
      <PolarChart
        data={skillsData}
        variant="rose"
        innerRadius={40}
        showLabels
        showValues={false}
        colorScheme={["#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"]}
      />
    </div>
  )
}
