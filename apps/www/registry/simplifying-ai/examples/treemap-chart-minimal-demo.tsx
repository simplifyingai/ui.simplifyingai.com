"use client"

import { TreemapChart } from "@/registry/simplifying-ai/ui/charts"

// Simple 2-level hierarchy
const data = {
  name: "Sales",
  children: [
    {
      name: "Q1",
      children: [
        { name: "Jan", value: 45, color: "#1e40af" },
        { name: "Feb", value: 38, color: "#2563eb" },
        { name: "Mar", value: 52, color: "#3b82f6" },
      ],
    },
    {
      name: "Q2",
      children: [
        { name: "Apr", value: 48, color: "#1e40af" },
        { name: "May", value: 55, color: "#2563eb" },
        { name: "Jun", value: 60, color: "#3b82f6" },
      ],
    },
    {
      name: "Q3",
      children: [
        { name: "Jul", value: 42, color: "#60a5fa" },
        { name: "Aug", value: 35, color: "#93c5fd" },
        { name: "Sep", value: 50, color: "#bfdbfe" },
      ],
    },
  ],
}

export default function TreemapChartMinimalDemo() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <TreemapChart
        data={data}
        width={340}
        height={280}
        showLabels
        labelMinSize={35}
      />
    </div>
  )
}
