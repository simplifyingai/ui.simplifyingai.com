"use client"

import { PieChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { label: "Chrome", value: 275 },
  { label: "Safari", value: 200 },
  { label: "Firefox", value: 187 },
  { label: "Edge", value: 173 },
  { label: "Other", value: 90 },
]

export default function PieChartDemo() {
  return (
    <div className="w-full max-w-xs">
      <PieChart data={data} width={280} height={280} showLegend={false} />
    </div>
  )
}
