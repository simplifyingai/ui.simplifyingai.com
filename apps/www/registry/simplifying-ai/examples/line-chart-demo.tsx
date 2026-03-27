"use client"

import { LineChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  {
    name: "Views",
    data: [
      { x: "Jan", y: 186 },
      { x: "Feb", y: 305 },
      { x: "Mar", y: 237 },
      { x: "Apr", y: 73 },
      { x: "May", y: 209 },
      { x: "Jun", y: 214 },
      { x: "Jul", y: 251 },
      { x: "Aug", y: 298 },
      { x: "Sep", y: 187 },
      { x: "Oct", y: 342 },
      { x: "Nov", y: 276 },
      { x: "Dec", y: 301 },
    ],
    color: "#93c5fd",
  },
]

export default function LineChartDemo() {
  return (
    <div className="w-full max-w-3xl">
      <LineChart data={data} />
    </div>
  )
}
