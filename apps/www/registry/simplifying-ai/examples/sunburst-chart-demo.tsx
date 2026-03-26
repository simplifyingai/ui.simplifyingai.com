"use client"

import { SunburstChart } from "@/registry/simplifying-ai/ui/charts"

const data = {
  name: "Sales",
  children: [
    {
      name: "North America",
      children: [
        { name: "USA", value: 45 },
        { name: "Canada", value: 15 },
        { name: "Mexico", value: 10 },
      ],
    },
    {
      name: "Europe",
      children: [
        { name: "UK", value: 20 },
        { name: "Germany", value: 18 },
        { name: "France", value: 12 },
      ],
    },
    {
      name: "Asia",
      children: [
        { name: "China", value: 30 },
        { name: "Japan", value: 25 },
        { name: "India", value: 15 },
      ],
    },
  ],
}

export default function SunburstChartDemo() {
  return (
    <div className="w-full max-w-md">
      <SunburstChart data={data} showLabels />
    </div>
  )
}
