"use client"

import { TreemapChart } from "@/registry/simplifying-ai/ui/charts"

const data = {
  name: "Portfolio",
  children: [
    {
      name: "Technology",
      children: [
        { name: "Apple", value: 25 },
        { name: "Microsoft", value: 22 },
        { name: "Google", value: 18 },
      ],
    },
    {
      name: "Healthcare",
      children: [
        { name: "Johnson & Johnson", value: 12 },
        { name: "Pfizer", value: 8 },
      ],
    },
    {
      name: "Finance",
      children: [
        { name: "JPMorgan", value: 10 },
        { name: "Goldman Sachs", value: 5 },
      ],
    },
  ],
}

export default function TreemapChartDemo() {
  return (
    <div className="w-full max-w-3xl">
      <TreemapChart data={data} showLabels />
    </div>
  )
}
