"use client"

import { SunburstChart } from "@/registry/simplifying-ai/ui/charts"

// Company revenue breakdown by region and product
const data = {
  name: "Revenue",
  children: [
    {
      name: "Americas",
      color: "#1e40af",
      children: [
        {
          name: "North",
          color: "#2563eb",
          children: [
            { name: "Software", value: 120, color: "#3b82f6" },
            { name: "Services", value: 80, color: "#60a5fa" },
            { name: "Hardware", value: 45, color: "#93c5fd" },
          ],
        },
        {
          name: "South",
          color: "#3b82f6",
          children: [
            { name: "Software", value: 65, color: "#60a5fa" },
            { name: "Services", value: 40, color: "#93c5fd" },
          ],
        },
      ],
    },
    {
      name: "EMEA",
      color: "#1e40af",
      children: [
        {
          name: "Western",
          color: "#2563eb",
          children: [
            { name: "Software", value: 95, color: "#3b82f6" },
            { name: "Services", value: 70, color: "#60a5fa" },
            { name: "Hardware", value: 35, color: "#93c5fd" },
          ],
        },
        {
          name: "Eastern",
          color: "#3b82f6",
          children: [
            { name: "Software", value: 45, color: "#60a5fa" },
            { name: "Services", value: 25, color: "#93c5fd" },
          ],
        },
      ],
    },
    {
      name: "APAC",
      color: "#1e40af",
      children: [
        {
          name: "East Asia",
          color: "#2563eb",
          children: [
            { name: "Software", value: 110, color: "#3b82f6" },
            { name: "Services", value: 85, color: "#60a5fa" },
            { name: "Hardware", value: 55, color: "#93c5fd" },
          ],
        },
        {
          name: "Southeast",
          color: "#3b82f6",
          children: [
            { name: "Software", value: 50, color: "#60a5fa" },
            { name: "Services", value: 30, color: "#93c5fd" },
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
