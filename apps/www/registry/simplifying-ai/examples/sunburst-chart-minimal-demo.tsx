"use client"

import { SunburstChart } from "@/registry/simplifying-ai/ui/charts"

// Simple 2-level hierarchy
const data = {
  name: "Total",
  children: [
    {
      name: "Category A",
      color: "#1e40af",
      children: [
        { name: "A1", value: 30, color: "#3b82f6" },
        { name: "A2", value: 25, color: "#60a5fa" },
      ],
    },
    {
      name: "Category B",
      color: "#2563eb",
      children: [
        { name: "B1", value: 40, color: "#60a5fa" },
        { name: "B2", value: 20, color: "#93c5fd" },
      ],
    },
    {
      name: "Category C",
      color: "#3b82f6",
      children: [
        { name: "C1", value: 35, color: "#93c5fd" },
        { name: "C2", value: 15, color: "#bfdbfe" },
      ],
    },
  ],
}

export default function SunburstChartMinimalDemo() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <SunburstChart
        data={data}
        width={320}
        height={320}
        innerRadius={55}
        padAngle={0.02}
        showLabels
      />
    </div>
  )
}
