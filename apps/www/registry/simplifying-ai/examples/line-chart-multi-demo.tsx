"use client"

import * as React from "react"

import { LineChart } from "@/registry/simplifying-ai/ui/charts"

// Generate deterministic multi-series data. Colors are intentionally omitted —
// the LineChart's `multi` variant assigns a validated, theme-aware categorical
// palette (--chart-series-*) in fixed hue order.
function generateMultiSeriesData() {
  const names = [
    "Product A",
    "Product B",
    "Product C",
    "Product D",
    "Product E",
    "Product F",
    "Product G",
    "Product H",
  ]

  // Use seeded pseudo-random for deterministic results
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  const result = []
  const startDate = new Date("2024-08-01")

  for (let s = 0; s < 8; s++) {
    const data: { x: Date; y: number }[] = []
    let value = 100 + seededRandom(s * 1000) * 400

    for (let i = 0; i < 100; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      const growth =
        1 + (seededRandom(s * 1000 + i) - 0.3) * 0.05 * (s % 3 === 0 ? 2 : 1)
      value *= growth
      value = Math.max(50, value)

      data.push({
        x: date,
        y: Math.round(value),
      })
    }

    result.push({
      name: names[s],
      data,
    })
  }

  return result
}

export default function LineChartMultiDemo() {
  const [data, setData] = React.useState<
    ReturnType<typeof generateMultiSeriesData>
  >([])

  React.useEffect(() => {
    setData(generateMultiSeriesData())
  }, [])

  if (data.length === 0) {
    return <div className="h-[400px] w-full max-w-4xl" />
  }

  return (
    <div className="w-full max-w-4xl">
      <LineChart
        data={data}
        variant="multi"
        xType="time"
        height={400}
        yAxisLabel="Value"
      />
    </div>
  )
}
