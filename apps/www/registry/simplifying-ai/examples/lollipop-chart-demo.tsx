"use client"

import { LollipopChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { category: "Jan", value: 45, color: "#1e40af" },
  { category: "Feb", value: 52, color: "#2563eb" },
  { category: "Mar", value: 78, color: "#3b82f6" },
  { category: "Apr", value: 65, color: "#60a5fa" },
  { category: "May", value: 89, color: "#93c5fd" },
  { category: "Jun", value: 72, color: "#1e40af" },
  { category: "Jul", value: 95, color: "#2563eb" },
  { category: "Aug", value: 82, color: "#3b82f6" },
]

export default function LollipopChartDemo() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <LollipopChart
        data={data}
        orientation="horizontal"
        dotSize={10}
        showValues
      />
    </div>
  )
}
