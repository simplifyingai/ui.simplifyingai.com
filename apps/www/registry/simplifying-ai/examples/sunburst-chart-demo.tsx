"use client"

import { SunburstChart } from "@/registry/simplifying-ai/ui/charts"

// Company revenue breakdown by region and product
// Colors are derived from CSS variables (--chart-1 through --chart-5) based on depth
const data = {
  name: "Revenue",
  children: [
    {
      name: "Americas",
      children: [
        {
          name: "North",
          children: [
            { name: "Software", value: 120 },
            { name: "Services", value: 80 },
            { name: "Hardware", value: 45 },
          ],
        },
        {
          name: "South",
          children: [
            { name: "Software", value: 65 },
            { name: "Services", value: 40 },
          ],
        },
      ],
    },
    {
      name: "EMEA",
      children: [
        {
          name: "Western",
          children: [
            { name: "Software", value: 95 },
            { name: "Services", value: 70 },
            { name: "Hardware", value: 35 },
          ],
        },
        {
          name: "Eastern",
          children: [
            { name: "Software", value: 45 },
            { name: "Services", value: 25 },
          ],
        },
      ],
    },
    {
      name: "APAC",
      children: [
        {
          name: "East Asia",
          children: [
            { name: "Software", value: 110 },
            { name: "Services", value: 85 },
            { name: "Hardware", value: 55 },
          ],
        },
        {
          name: "Southeast",
          children: [
            { name: "Software", value: 50 },
            { name: "Services", value: 30 },
          ],
        },
      ],
    },
  ],
}

export default function SunburstChartDemo() {
  return (
    <div className="mx-auto w-full max-w-md">
      <SunburstChart
        data={data}
        width={400}
        height={400}
        innerRadius={40}
        showLabels
        labelMinAngle={0.15}
      />
    </div>
  )
}
