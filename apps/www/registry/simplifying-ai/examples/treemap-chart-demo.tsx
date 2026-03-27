"use client"

import { TreemapChart } from "@/registry/simplifying-ai/ui/charts"

// Market capitalization by sector and industry
const data = {
  name: "Market",
  children: [
    {
      name: "Technology",
      children: [
        { name: "Apple", value: 185, color: "#1e40af" },
        { name: "Microsoft", value: 170, color: "#2563eb" },
        { name: "Nvidia", value: 120, color: "#3b82f6" },
        { name: "Google", value: 95, color: "#60a5fa" },
        { name: "Meta", value: 65, color: "#93c5fd" },
        { name: "Tesla", value: 55, color: "#bfdbfe" },
      ],
    },
    {
      name: "Healthcare",
      children: [
        { name: "UnitedHealth", value: 85, color: "#1e40af" },
        { name: "J&J", value: 75, color: "#2563eb" },
        { name: "Eli Lilly", value: 70, color: "#3b82f6" },
        { name: "Pfizer", value: 45, color: "#60a5fa" },
        { name: "Merck", value: 40, color: "#93c5fd" },
      ],
    },
    {
      name: "Finance",
      children: [
        { name: "Berkshire", value: 90, color: "#1e40af" },
        { name: "JPMorgan", value: 75, color: "#2563eb" },
        { name: "Visa", value: 55, color: "#3b82f6" },
        { name: "Mastercard", value: 45, color: "#60a5fa" },
      ],
    },
    {
      name: "Energy",
      children: [
        { name: "Exxon", value: 65, color: "#1e40af" },
        { name: "Chevron", value: 50, color: "#2563eb" },
        { name: "Shell", value: 35, color: "#3b82f6" },
      ],
    },
    {
      name: "Consumer",
      children: [
        { name: "Amazon", value: 110, color: "#1e40af" },
        { name: "Walmart", value: 55, color: "#2563eb" },
        { name: "Costco", value: 40, color: "#3b82f6" },
        { name: "P&G", value: 35, color: "#60a5fa" },
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
