"use client"

import { TreemapChart } from "@/registry/simplifying-ai/ui/charts"

// Market capitalization by sector and industry
// Colors are derived from CSS variables (--chart-1 through --chart-5)
const data = {
  name: "Market",
  children: [
    {
      name: "Technology",
      children: [
        { name: "Apple", value: 185 },
        { name: "Microsoft", value: 170 },
        { name: "Nvidia", value: 120 },
        { name: "Google", value: 95 },
        { name: "Meta", value: 65 },
        { name: "Tesla", value: 55 },
      ],
    },
    {
      name: "Healthcare",
      children: [
        { name: "UnitedHealth", value: 85 },
        { name: "J&J", value: 75 },
        { name: "Eli Lilly", value: 70 },
        { name: "Pfizer", value: 45 },
        { name: "Merck", value: 40 },
      ],
    },
    {
      name: "Finance",
      children: [
        { name: "Berkshire", value: 90 },
        { name: "JPMorgan", value: 75 },
        { name: "Visa", value: 55 },
        { name: "Mastercard", value: 45 },
      ],
    },
    {
      name: "Energy",
      children: [
        { name: "Exxon", value: 65 },
        { name: "Chevron", value: 50 },
        { name: "Shell", value: 35 },
      ],
    },
    {
      name: "Consumer",
      children: [
        { name: "Amazon", value: 110 },
        { name: "Walmart", value: 55 },
        { name: "Costco", value: 40 },
        { name: "P&G", value: 35 },
      ],
    },
  ],
}

export default function TreemapChartDemo() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <TreemapChart
        data={data}
        width={500}
        height={400}
        showLabels
        labelMinSize={35}
        paddingInner={2}
      />
    </div>
  )
}
