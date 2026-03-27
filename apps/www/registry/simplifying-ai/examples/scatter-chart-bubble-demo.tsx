"use client"

import { ScatterChart } from "@/registry/simplifying-ai/ui/charts"

// Company market data with size representing market cap
const data = [
  {
    name: "Tech Companies",
    color: "#1e40af",
    data: [
      { x: 15, y: 85, size: 120, label: "TechCorp" },
      { x: 45, y: 72, size: 85, label: "DataSoft" },
      { x: 65, y: 90, size: 150, label: "CloudNet" },
      { x: 80, y: 65, size: 60, label: "AppWorks" },
      { x: 35, y: 55, size: 45, label: "CodeLab" },
    ],
  },
  {
    name: "Finance Companies",
    color: "#3b82f6",
    data: [
      { x: 25, y: 45, size: 100, label: "FinBank" },
      { x: 55, y: 78, size: 130, label: "InvestCo" },
      { x: 70, y: 52, size: 75, label: "TradeFirm" },
      { x: 40, y: 88, size: 95, label: "WealthMgmt" },
    ],
  },
]

export default function ScatterChartBubbleDemo() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <ScatterChart
        data={data}
        width={500}
        height={320}
        showLegend
        sizeRange={[8, 28]}
        xAxisLabel="Growth Rate (%)"
        yAxisLabel="Profit Margin (%)"
      />
    </div>
  )
}
