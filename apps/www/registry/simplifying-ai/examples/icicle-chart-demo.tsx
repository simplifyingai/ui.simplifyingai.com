"use client"

import { IcicleChart } from "@/registry/simplifying-ai/ui/charts"

const data = {
  name: "Company",
  children: [
    {
      name: "Engineering",
      children: [
        { name: "Frontend", value: 25 },
        { name: "Backend", value: 30 },
        { name: "DevOps", value: 15 },
        { name: "QA", value: 12 },
      ],
    },
    {
      name: "Product",
      children: [
        { name: "Design", value: 18 },
        { name: "Research", value: 10 },
        { name: "Analytics", value: 8 },
      ],
    },
    {
      name: "Sales",
      children: [
        { name: "Enterprise", value: 22 },
        { name: "SMB", value: 15 },
        { name: "Partners", value: 10 },
      ],
    },
    {
      name: "Operations",
      children: [
        { name: "HR", value: 12 },
        { name: "Finance", value: 10 },
        { name: "Legal", value: 5 },
      ],
    },
  ],
}

export default function IcicleChartDemo() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <IcicleChart data={data} orientation="vertical" showLabels />
    </div>
  )
}
