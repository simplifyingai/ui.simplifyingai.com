"use client"

import { PieChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { label: "Chrome", value: 275, color: "#2563eb" },
  { label: "Safari", value: 200, color: "#3b82f6" },
  { label: "Firefox", value: 187, color: "#60a5fa" },
  { label: "Edge", value: 173, color: "#93c5fd" },
  { label: "Other", value: 90, color: "#bfdbfe" },
]

export default function PieChartLabelDemo() {
  return (
    <div className="w-full max-w-lg">
      <PieChart data={data} variant="label" showLabels />
    </div>
  )
}
