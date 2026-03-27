"use client"

import { IcicleChart } from "@/registry/simplifying-ai/ui/charts"

const data = {
  name: "Company",
  children: [
    {
      name: "Engineering",
      children: [
        { name: "Frontend", value: 25, color: "#1e40af" },
        { name: "Backend", value: 30, color: "#2563eb" },
        { name: "DevOps", value: 15, color: "#3b82f6" },
        { name: "QA", value: 12, color: "#60a5fa" },
      ],
    },
    {
      name: "Product",
      children: [
        { name: "Design", value: 18, color: "#1e40af" },
        { name: "Research", value: 10, color: "#2563eb" },
        { name: "Analytics", value: 8, color: "#3b82f6" },
      ],
    },
    {
      name: "Sales",
      children: [
        { name: "Enterprise", value: 22, color: "#1e40af" },
        { name: "SMB", value: 15, color: "#2563eb" },
        { name: "Partners", value: 10, color: "#3b82f6" },
      ],
    },
    {
      name: "Operations",
      children: [
        { name: "HR", value: 12, color: "#1e40af" },
        { name: "Finance", value: 10, color: "#2563eb" },
        { name: "Legal", value: 5, color: "#3b82f6" },
      ],
    },
  ],
}

export default function IcicleChartDemo() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <IcicleChart
        data={data}
        orientation="vertical"
        showLabels
      />
    </div>
  )
}
