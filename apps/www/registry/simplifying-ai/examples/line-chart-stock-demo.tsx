"use client"

import * as React from "react"

import { LineChart } from "@/registry/simplifying-ai/ui/charts"

// Generate stock price data (like Amazon chart)
function generateStockData(days: number): { x: Date; y: number }[] {
  const data: { x: Date; y: number }[] = []
  const startDate = new Date("2024-01-02")

  // Seeded pseudo-random for deterministic results
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  let price = 1180

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue

    // Random walk with upward drift (typical stock behavior)
    const drift = 0.0008
    const volatility = 0.02
    const change = drift + volatility * (seededRandom(i * 50) - 0.5) * 2
    price *= 1 + change

    // Add some intraday variation
    price += (seededRandom(i * 100) - 0.5) * 10

    data.push({
      x: date,
      y: Math.round(price * 100) / 100,
    })
  }

  return data
}

export default function LineChartStockDemo() {
  const [data, setData] = React.useState<{ x: Date; y: number }[]>([])

  React.useEffect(() => {
    setData(generateStockData(280))
  }, [])

  if (data.length === 0) {
    return <div className="h-[400px] w-full max-w-4xl" />
  }

  return (
    <div className="w-full max-w-4xl">
      <LineChart
        data={[
          {
            name: "AMZN",
            data: data,
            color: "#0d9488",
          },
        ]}
        variant="stock"
        xType="time"
        height={400}
        title="Amazon"
        subtitle="2024 year to date"
        yAxisLabel="Closing Price"
        xAxisLabel="Date"
        yAxisFormatter={(value) => `$${value.toLocaleString()}`}
      />
    </div>
  )
}
