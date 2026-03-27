"use client"

import { OHLCChart } from "@/registry/simplifying-ai/ui/charts"

// Generate sample OHLC data
const generateOHLCData = () => {
  const data = []
  let price = 150
  const startDate = new Date("2024-01-01")

  for (let i = 0; i < 60; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)

    const volatility = 0.02
    const change = (Math.random() - 0.5) * price * volatility * 2
    const open = price
    const close = price + change
    const high = Math.max(open, close) + Math.random() * price * volatility
    const low = Math.min(open, close) - Math.random() * price * volatility

    data.push({
      date: date.toISOString().split("T")[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
    })

    price = close
  }

  return data
}

const data = generateOHLCData()

export default function OHLCChartDemo() {
  return (
    <div className="w-full max-w-2xl">
      <OHLCChart data={data} />
    </div>
  )
}
