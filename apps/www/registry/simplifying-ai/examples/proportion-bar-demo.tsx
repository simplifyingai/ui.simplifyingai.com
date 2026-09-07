"use client"

import { ProportionBar } from "@/registry/simplifying-ai/ui/charts"

// Shares of income, so the track is a full 100 and the gap is what is left.
const breakdown = [
  { label: "Needs", value: 45, color: "var(--chart-series-1)" },
  { label: "Transportation", value: 20, color: "var(--chart-series-5)" },
  { label: "Entertainment", value: 10, color: "var(--chart-series-2)" },
]

export default function ProportionBarDemo() {
  return (
    <ProportionBar
      className="max-w-sm"
      data={breakdown}
      total={100}
      height={32}
    />
  )
}
