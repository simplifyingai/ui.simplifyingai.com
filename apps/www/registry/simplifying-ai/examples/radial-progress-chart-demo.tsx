"use client"

import { RadialProgressChart } from "@/registry/simplifying-ai/ui/charts"

const subscriptions = [
  { name: "Figma", value: 96.07, max: 120, color: "var(--chart-4)" },
  { name: "Netflix", value: 23.01, max: 120, color: "var(--chart-2)" },
  { name: "ChatGPT", value: 20.0, max: 120, color: "var(--chart-1)" },
]

export default function RadialProgressChartDemo() {
  return (
    <RadialProgressChart
      className="max-w-lg"
      data={subscriptions}
      thickness={14}
      gap={10}
      showLegend
      valueFormatter={(v) => `$${v.toFixed(2)}`}
    >
      <span className="text-3xl font-semibold tracking-tight">80%</span>
      <span className="text-muted-foreground text-xs">of budget</span>
    </RadialProgressChart>
  )
}
