"use client"

import { TreemapChart } from "@/registry/simplifying-ai/ui/charts"

// Investment portfolio allocation
const data = {
  name: "Portfolio",
  children: [
    {
      name: "Stocks",
      children: [
        { name: "US Large Cap", value: 35, color: "#1e40af" },
        { name: "US Small Cap", value: 15, color: "#2563eb" },
        { name: "International", value: 20, color: "#3b82f6" },
        { name: "Emerging", value: 10, color: "#60a5fa" },
      ],
    },
    {
      name: "Bonds",
      children: [
        { name: "Government", value: 8, color: "#1e40af" },
        { name: "Corporate", value: 5, color: "#2563eb" },
        { name: "Municipal", value: 3, color: "#3b82f6" },
      ],
    },
    {
      name: "Alternatives",
      children: [
        { name: "Real Estate", value: 6, color: "#1e40af" },
        { name: "Commodities", value: 4, color: "#2563eb" },
        { name: "Crypto", value: 2, color: "#3b82f6" },
      ],
    },
    {
      name: "Cash",
      children: [
        { name: "Money Market", value: 3, color: "#93c5fd" },
        { name: "Savings", value: 2, color: "#bfdbfe" },
      ],
    },
  ],
}

export default function TreemapChartPortfolioDemo() {
  return (
    <div className="mx-auto w-full max-w-md">
      <TreemapChart
        data={data}
        width={420}
        height={350}
        showLabels
        labelMinSize={30}
      />
    </div>
  )
}
