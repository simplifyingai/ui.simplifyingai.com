"use client"

import { SunburstChart } from "@/registry/simplifying-ai/ui/charts"

// Company organizational structure
const data = {
  name: "Company",
  children: [
    {
      name: "Engineering",
      color: "#1e40af",
      children: [
        { name: "Frontend", value: 25, color: "#2563eb" },
        { name: "Backend", value: 30, color: "#3b82f6" },
        { name: "DevOps", value: 12, color: "#60a5fa" },
        { name: "QA", value: 15, color: "#93c5fd" },
      ],
    },
    {
      name: "Product",
      color: "#1e40af",
      children: [
        { name: "Design", value: 18, color: "#2563eb" },
        { name: "Research", value: 10, color: "#3b82f6" },
        { name: "Analytics", value: 8, color: "#60a5fa" },
      ],
    },
    {
      name: "Sales",
      color: "#1e40af",
      children: [
        { name: "Enterprise", value: 20, color: "#2563eb" },
        { name: "SMB", value: 15, color: "#3b82f6" },
        { name: "Partners", value: 10, color: "#60a5fa" },
      ],
    },
    {
      name: "Operations",
      color: "#1e40af",
      children: [
        { name: "HR", value: 12, color: "#2563eb" },
        { name: "Finance", value: 10, color: "#3b82f6" },
        { name: "Legal", value: 5, color: "#60a5fa" },
      ],
    },
  ],
}

export default function SunburstChartOrganizationalDemo() {
  return (
    <div className="mx-auto w-full max-w-md">
      <SunburstChart
        data={data}
        width={380}
        height={380}
        innerRadius={45}
        showLabels
      />
    </div>
  )
}
