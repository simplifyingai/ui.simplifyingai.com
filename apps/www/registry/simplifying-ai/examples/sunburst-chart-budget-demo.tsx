"use client"

import { SunburstChart } from "@/registry/simplifying-ai/ui/charts"

// Annual budget allocation
const data = {
  name: "Budget",
  children: [
    {
      name: "Marketing",
      color: "#1e40af",
      children: [
        {
          name: "Digital",
          color: "#2563eb",
          children: [
            { name: "Social", value: 45, color: "#3b82f6" },
            { name: "Search", value: 35, color: "#60a5fa" },
            { name: "Display", value: 20, color: "#93c5fd" },
          ],
        },
        {
          name: "Traditional",
          color: "#3b82f6",
          children: [
            { name: "TV", value: 40, color: "#60a5fa" },
            { name: "Print", value: 15, color: "#93c5fd" },
          ],
        },
      ],
    },
    {
      name: "R&D",
      color: "#1e40af",
      children: [
        { name: "Research", value: 80, color: "#2563eb" },
        { name: "Development", value: 120, color: "#3b82f6" },
        { name: "Testing", value: 40, color: "#60a5fa" },
      ],
    },
    {
      name: "Operations",
      color: "#1e40af",
      children: [
        { name: "Infrastructure", value: 65, color: "#2563eb" },
        { name: "Support", value: 45, color: "#3b82f6" },
        { name: "Admin", value: 30, color: "#60a5fa" },
      ],
    },
  ],
}

export default function SunburstChartBudgetDemo() {
  return (
    <div className="mx-auto w-full max-w-md">
      <SunburstChart
        data={data}
        width={380}
        height={380}
        innerRadius={50}
        padAngle={0.02}
        showLabels
      />
    </div>
  )
}
