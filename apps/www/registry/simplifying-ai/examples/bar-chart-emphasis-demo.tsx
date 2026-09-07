"use client"

import {
  BarChart,
  ChartThemeProvider,
} from "@/registry/simplifying-ai/ui/charts"

const chartData = [
  { label: "Jan", value: 5120 },
  { label: "Feb", value: 6840 },
  { label: "Mar", value: 5960 },
  { label: "Apr", value: 9980 },
  { label: "May", value: 9467 },
  { label: "Jun", value: 8210 },
  { label: "Jul", value: 7340 },
]

const currency = (value: number) => `$${value.toLocaleString("en-US")}`

export default function BarChartEmphasisDemo() {
  return (
    <ChartThemeProvider preset="dashboard">
      <BarChart
        className="max-w-md"
        data={chartData}
        activeLabel="May"
        showActiveValue
        showGrid={false}
        showYAxis={false}
        aspectRatio={1.6}
        valueFormatter={currency}
        referenceLine={{ value: "avg", label: "Average" }}
      />
    </ChartThemeProvider>
  )
}
