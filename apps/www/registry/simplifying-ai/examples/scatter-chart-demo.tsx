"use client"

import { ScatterChart } from "@/registry/simplifying-ai/ui/charts"

// Rich dataset with many scattered points and varied sizes
const data = [
  {
    name: "Category A",
    color: "#1e40af",
    symbol: "circle" as const,
    data: [
      { x: 12, y: 85, size: 45 },
      { x: 25, y: 42, size: 28 },
      { x: 38, y: 68, size: 62 },
      { x: 52, y: 25, size: 35 },
      { x: 65, y: 78, size: 48 },
      { x: 78, y: 55, size: 22 },
      { x: 18, y: 92, size: 55 },
      { x: 42, y: 35, size: 32 },
      { x: 58, y: 88, size: 42 },
      { x: 72, y: 48, size: 38 },
      { x: 85, y: 72, size: 52 },
      { x: 32, y: 58, size: 28 },
      { x: 48, y: 15, size: 35 },
      { x: 62, y: 95, size: 65 },
      { x: 8, y: 65, size: 25 },
      { x: 92, y: 38, size: 42 },
    ],
  },
  {
    name: "Category B",
    color: "#2563eb",
    symbol: "circle" as const,
    data: [
      { x: 15, y: 52, size: 38 },
      { x: 28, y: 78, size: 45 },
      { x: 42, y: 32, size: 28 },
      { x: 55, y: 65, size: 52 },
      { x: 68, y: 88, size: 35 },
      { x: 82, y: 42, size: 48 },
      { x: 22, y: 72, size: 32 },
      { x: 35, y: 18, size: 25 },
      { x: 48, y: 58, size: 42 },
      { x: 62, y: 82, size: 55 },
      { x: 75, y: 28, size: 38 },
      { x: 88, y: 62, size: 45 },
      { x: 5, y: 45, size: 22 },
      { x: 95, y: 75, size: 58 },
      { x: 38, y: 92, size: 48 },
      { x: 72, y: 12, size: 32 },
    ],
  },
  {
    name: "Category C",
    color: "#3b82f6",
    symbol: "circle" as const,
    data: [
      { x: 18, y: 38, size: 42 },
      { x: 32, y: 62, size: 35 },
      { x: 45, y: 85, size: 55 },
      { x: 58, y: 22, size: 28 },
      { x: 72, y: 68, size: 48 },
      { x: 85, y: 45, size: 32 },
      { x: 25, y: 55, size: 38 },
      { x: 38, y: 78, size: 52 },
      { x: 52, y: 42, size: 25 },
      { x: 65, y: 92, size: 62 },
      { x: 78, y: 28, size: 35 },
      { x: 92, y: 58, size: 45 },
      { x: 12, y: 75, size: 38 },
      { x: 28, y: 15, size: 22 },
      { x: 68, y: 52, size: 42 },
      { x: 82, y: 88, size: 58 },
    ],
  },
  {
    name: "Category D",
    color: "#60a5fa",
    symbol: "circle" as const,
    data: [
      { x: 22, y: 48, size: 35 },
      { x: 35, y: 72, size: 48 },
      { x: 48, y: 28, size: 32 },
      { x: 62, y: 55, size: 42 },
      { x: 75, y: 82, size: 55 },
      { x: 88, y: 35, size: 28 },
      { x: 15, y: 68, size: 45 },
      { x: 28, y: 95, size: 62 },
      { x: 42, y: 18, size: 25 },
      { x: 55, y: 75, size: 52 },
      { x: 68, y: 42, size: 38 },
      { x: 82, y: 65, size: 48 },
      { x: 8, y: 88, size: 55 },
      { x: 95, y: 22, size: 32 },
      { x: 38, y: 58, size: 42 },
      { x: 72, y: 8, size: 28 },
    ],
  },
  {
    name: "Category E",
    color: "#93c5fd",
    symbol: "circle" as const,
    data: [
      { x: 10, y: 32, size: 28 },
      { x: 25, y: 58, size: 42 },
      { x: 40, y: 82, size: 55 },
      { x: 55, y: 15, size: 22 },
      { x: 70, y: 45, size: 35 },
      { x: 85, y: 72, size: 48 },
      { x: 18, y: 88, size: 58 },
      { x: 32, y: 25, size: 32 },
      { x: 48, y: 65, size: 45 },
      { x: 62, y: 38, size: 38 },
      { x: 78, y: 92, size: 62 },
      { x: 92, y: 52, size: 42 },
      { x: 5, y: 78, size: 48 },
      { x: 38, y: 42, size: 35 },
      { x: 65, y: 18, size: 25 },
      { x: 80, y: 58, size: 38 },
    ],
  },
]

export default function ScatterChartDemo() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <ScatterChart
        data={data}
        width={560}
        height={400}
        sizeRange={[6, 24]}
        showLegend
        xAxisLabel="Cost Index"
        yAxisLabel="Performance Score"
        margin={{ top: 20, right: 30, bottom: 50, left: 70 }}
      />
    </div>
  )
}
