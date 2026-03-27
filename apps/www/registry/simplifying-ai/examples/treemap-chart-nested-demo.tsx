"use client"

import { TreemapChart } from "@/registry/simplifying-ai/ui/charts"

// Deep organizational hierarchy
const data = {
  name: "Company",
  children: [
    {
      name: "Engineering",
      children: [
        {
          name: "Frontend",
          children: [
            { name: "React", value: 12, color: "#1e40af" },
            { name: "Vue", value: 8, color: "#2563eb" },
            { name: "Angular", value: 5, color: "#3b82f6" },
          ],
        },
        {
          name: "Backend",
          children: [
            { name: "Node.js", value: 15, color: "#1e40af" },
            { name: "Python", value: 12, color: "#2563eb" },
            { name: "Go", value: 8, color: "#3b82f6" },
          ],
        },
        {
          name: "DevOps",
          children: [
            { name: "AWS", value: 6, color: "#60a5fa" },
            { name: "K8s", value: 5, color: "#93c5fd" },
          ],
        },
      ],
    },
    {
      name: "Product",
      children: [
        { name: "Design", value: 10, color: "#1e40af" },
        { name: "Research", value: 6, color: "#2563eb" },
        { name: "Analytics", value: 5, color: "#3b82f6" },
      ],
    },
    {
      name: "Operations",
      children: [
        { name: "HR", value: 8, color: "#1e40af" },
        { name: "Finance", value: 6, color: "#2563eb" },
        { name: "Legal", value: 4, color: "#3b82f6" },
      ],
    },
  ],
}

export default function TreemapChartNestedDemo() {
  return (
    <div className="mx-auto w-full max-w-md">
      <TreemapChart
        data={data}
        width={420}
        height={350}
        showLabels
        labelMinSize={25}
        paddingInner={3}
      />
    </div>
  )
}
