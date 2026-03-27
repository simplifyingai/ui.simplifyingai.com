"use client"

import * as React from "react"

import { LineChart } from "@/registry/simplifying-ai/ui/charts"

// Generate smooth time series data (like Google Analytics)
function generateTimeSeriesData(days: number): { x: Date; y: number }[] {
  const data: { x: Date; y: number }[] = []
  const startDate = new Date("2024-04-01")

  // Seeded pseudo-random for deterministic results
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  let value = 50

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)

    // Random walk with some periodicity
    value += (seededRandom(i * 100) - 0.5) * 20
    value = Math.max(10, Math.min(100, value))

    // Add some weekly pattern
    const dayOfWeek = date.getDay()
    const weekendDip = dayOfWeek === 0 || dayOfWeek === 6 ? -15 : 0

    data.push({
      x: date,
      y: Math.round(value + weekendDip + Math.sin(i / 7) * 10),
    })
  }

  return data
}

export default function LineChartSmoothDemo() {
  const [data, setData] = React.useState<{ x: Date; y: number }[]>([])

  React.useEffect(() => {
    setData(generateTimeSeriesData(90))
  }, [])

  if (data.length === 0) {
    return <div className="h-[300px] w-full max-w-4xl" />
  }

  return (
    <div className="w-full max-w-4xl">
      <LineChart
        data={[
          {
            name: "Traffic",
            data: data,
            color: "#93c5fd",
          },
        ]}
        variant="smooth"
        xType="time"
        height={300}
        strokeWidth={2}
      />
    </div>
  )
}
