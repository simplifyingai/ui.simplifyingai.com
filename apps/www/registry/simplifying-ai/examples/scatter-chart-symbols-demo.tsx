"use client"

import { ScatterChart } from "@/registry/simplifying-ai/ui/charts"

// Different product categories with unique symbols
const data = [
  {
    name: "Electronics",
    color: "#1e40af",
    symbol: "circle" as const,
    data: [
      { x: 20, y: 75 },
      { x: 45, y: 82 },
      { x: 70, y: 68 },
      { x: 85, y: 90 },
    ],
  },
  {
    name: "Clothing",
    color: "#2563eb",
    symbol: "square" as const,
    data: [
      { x: 15, y: 45 },
      { x: 40, y: 55 },
      { x: 60, y: 62 },
      { x: 80, y: 48 },
    ],
  },
  {
    name: "Food & Beverage",
    color: "#3b82f6",
    symbol: "triangle" as const,
    data: [
      { x: 25, y: 35 },
      { x: 50, y: 42 },
      { x: 65, y: 38 },
      { x: 90, y: 52 },
    ],
  },
  {
    name: "Home & Garden",
    color: "#60a5fa",
    symbol: "diamond" as const,
    data: [
      { x: 30, y: 58 },
      { x: 55, y: 72 },
      { x: 75, y: 65 },
      { x: 95, y: 78 },
    ],
  },
]

export default function ScatterChartSymbolsDemo() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <ScatterChart
        data={data}
        width={500}
        height={340}
        size={10}
        showLegend
        xAxisLabel="Price Point ($)"
        yAxisLabel="Customer Rating"
      />
    </div>
  )
}
