"use client"

import { LineChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  {
    name: "AAPL",
    data: [
      { x: "2024-01-02", y: 185 },
      { x: "2024-01-15", y: 192 },
      { x: "2024-02-01", y: 188 },
      { x: "2024-02-15", y: 195 },
      { x: "2024-03-01", y: 178 },
      { x: "2024-03-15", y: 172 },
      { x: "2024-04-01", y: 169 },
      { x: "2024-04-15", y: 183 },
      { x: "2024-05-01", y: 190 },
      { x: "2024-05-15", y: 198 },
      { x: "2024-06-01", y: 212 },
      { x: "2024-06-15", y: 207 },
    ],
  },
]

export default function LineChartDemo() {
  return (
    <div className="w-full max-w-3xl">
      <LineChart data={data} variant="stock" xType="time" />
    </div>
  )
}
