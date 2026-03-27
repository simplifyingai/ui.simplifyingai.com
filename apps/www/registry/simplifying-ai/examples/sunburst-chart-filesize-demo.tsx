"use client"

import { SunburstChart } from "@/registry/simplifying-ai/ui/charts"

// Project file structure by size
const data = {
  name: "Project",
  children: [
    {
      name: "src",
      color: "#1e40af",
      children: [
        {
          name: "components",
          color: "#2563eb",
          children: [
            { name: "ui", value: 85, color: "#3b82f6" },
            { name: "forms", value: 45, color: "#60a5fa" },
            { name: "layout", value: 35, color: "#93c5fd" },
          ],
        },
        {
          name: "lib",
          color: "#3b82f6",
          children: [
            { name: "utils", value: 25, color: "#60a5fa" },
            { name: "hooks", value: 20, color: "#93c5fd" },
          ],
        },
        {
          name: "app",
          color: "#60a5fa",
          children: [
            { name: "pages", value: 55, color: "#93c5fd" },
            { name: "api", value: 40, color: "#bfdbfe" },
          ],
        },
      ],
    },
    {
      name: "public",
      color: "#1e40af",
      children: [
        { name: "images", value: 120, color: "#2563eb" },
        { name: "fonts", value: 35, color: "#3b82f6" },
        { name: "icons", value: 15, color: "#60a5fa" },
      ],
    },
    {
      name: "node_modules",
      color: "#1e40af",
      children: [
        { name: "react", value: 80, color: "#2563eb" },
        { name: "next", value: 150, color: "#3b82f6" },
        { name: "other", value: 200, color: "#60a5fa" },
      ],
    },
  ],
}

export default function SunburstChartFilesizeDemo() {
  return (
    <div className="mx-auto w-full max-w-md">
      <SunburstChart
        data={data}
        width={380}
        height={380}
        innerRadius={35}
        cornerRadius={2}
        showLabels
        labelMinAngle={0.12}
      />
    </div>
  )
}
