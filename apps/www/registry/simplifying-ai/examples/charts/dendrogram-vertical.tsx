"use client"

import { Dendrogram } from "@/registry/simplifying-ai/ui/charts/specialized/dendrogram"

const orgData = {
  name: "CEO",
  children: [
    {
      name: "CTO",
      children: [
        { name: "Engineering Lead", value: 8 },
        { name: "DevOps Lead", value: 4 },
        { name: "QA Lead", value: 5 },
      ],
    },
    {
      name: "CFO",
      children: [
        { name: "Accounting", value: 3 },
        { name: "Finance", value: 4 },
      ],
    },
    {
      name: "CMO",
      children: [
        { name: "Marketing", value: 6 },
        { name: "Sales", value: 12 },
      ],
    },
  ],
}

export default function DendrogramVertical() {
  return (
    <div className="w-full max-w-xl mx-auto">
      <Dendrogram
        data={orgData}
        orientation="vertical"
        showLabels
        showValues
        colorScheme={["#0891b2", "#06b6d4", "#22d3ee", "#67e8f9", "#a5f3fc"]}
      />
    </div>
  )
}
